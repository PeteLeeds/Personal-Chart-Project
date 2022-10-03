import { Chart } from "./chart";

export interface Series {
    id: string;
    name: string;
    charts: Chart[]
}