import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { MondayService } from "../services/mondayService"; // Fix import
import formulaService from "../services/formulaService";

export async function mondayAction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as any;

        // Challenge validation
        if (body.challenge) {
            return { body: JSON.stringify({ challenge: body.challenge }) };
        }

        const { payload } = body;
        if (!payload) {
            return { status: 400, body: "No payload found" };
        }

        const { inputFields, inboundFieldValues } = payload;
        const { boardId, itemId } = inboundFieldValues;
        const { formula, targetColumnId } = inputFields;

        if (!formula || !targetColumnId) {
            return { status: 400, body: "Missing formula or targetColumnId configuration" };
        }

        context.log(`Executing formula "${formula}" for item ${itemId} on board ${boardId}`);

        const token = request.headers.get('authorization');
        if (!token) {
            return { status: 401, body: "Unauthorized" };
        }

        const mondayService = new MondayService(token);

        // 1. Fetch Item Data
        const item = await mondayService.getItem(itemId);
        if (!item) {
            return { status: 404, body: "Item not found" };
        }

        // 2. Evaluate Formula
        const result = formulaService.evaluate(formula, item);
        context.log(`Formula result: ${result}`);

        // 3. Update Target Column
        await mondayService.updateColumn(boardId, itemId, targetColumnId, result);

        return { body: JSON.stringify({ success: true, result }) };

    } catch (error: any) {
        context.error(`Error processing webhook: ${error.message}`);
        return { status: 500, body: JSON.stringify({ error: error.message }) };
    }
}

app.http('mondayAction', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: mondayAction
});
