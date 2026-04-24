import { BASE_URL } from "./constants";


export async function getDataSourceStatus(){
    try {

        const response = await fetch(`${BASE_URL}/api/data-source-status`);

        const result = await response.json();

        return result;
    } catch (error) {
        console.error("getDbStatus failed:", error);
        throw error;
    }
}