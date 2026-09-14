export interface NoteTreeItem {
    key: string
    label: string
    default?: boolean
    published?: boolean
    favorite?: boolean
    children?: Array<NoteTreeItem>
}