export interface LinkItem {
    name: string;
    icon?: string;
    url: string;
    descriptions?: string;
    singleIcon?: boolean;
    textIcon?: string;
    iconWidth?: number;
    iconHeight?: number;
}

export interface NavItem {
    title: string;
    descriptions?: string;
    linkList: Array<LinkItem>;
}
