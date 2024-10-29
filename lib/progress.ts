export type ProgressType = {
    // document: string,
    set: (s: string, percent: number,) => void,
    remove: () => void
}