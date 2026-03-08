export interface ToolBoxChildItem {
    name: string;
    descriptions?: string;
    icon: string;
    url: string;
}

export interface ToolBoxItem {
    title: string;
    descriptions?: string;
    children: Array<ToolBoxChildItem>;
}
