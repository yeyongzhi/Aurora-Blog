export interface NoteTreeItem {
    key: string
    label: string
    default?: boolean
    favorite?: boolean
    children?: Array<NoteTreeItem>
}