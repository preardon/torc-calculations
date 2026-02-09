import mondaySdk from 'monday-sdk-js';

// Define specific interfaces for Monday.com types
interface MondayItem {
    id: string;
    name: string;
    column_values: MondayColumnValue[];
}

interface MondayColumnValue {
    id: string;
    text: string;
    value: string | null;
    type: string;
    // Add other properties as needed
}

export class MondayService {
    private monday: any;
    private token: string;

    constructor(token: string) {
        this.token = token;
        this.monday = mondaySdk();
        this.monday.setToken(token);
    }

    async getItem(itemId: number | string): Promise<MondayItem> {
        try {
            const query = `query {
        items (ids: [${itemId}]) {
          id
          name
          column_values {
            id
            text
            value
            type
          }
        }
      }`;
            const response = await this.monday.api(query);
            if (response.errors) {
                throw new Error(JSON.stringify(response.errors));
            }
            return response.data.items[0] as MondayItem;
        } catch (error) {
            console.error('Error fetching item:', error);
            throw error;
        }
    }

    async updateColumn(boardId: number | string, itemId: number | string, columnId: string, value: any): Promise<any> {
        try {
            const mutation = `mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
        change_column_value (board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
          id
        }
      }`;

            const variables = {
                boardId: Number(boardId),
                itemId: Number(itemId),
                columnId,
                value: typeof value === 'string' ? value : JSON.stringify(value)
            };

            const response = await this.monday.api(mutation, { variables });
            if (response.errors) {
                throw new Error(JSON.stringify(response.errors));
            }
            return response.data;
        } catch (error) {
            console.error('Error updating column:', error);
            throw error;
        }
    }
}
