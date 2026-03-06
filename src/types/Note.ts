export interface NoteTreeItem {
    key: string
    label: string
    default?: boolean
    children?: Array<NoteTreeItem>
}