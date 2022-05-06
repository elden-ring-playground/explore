// the structure of elden-ring-data/msg/{$LANG}/{$TYPE}.msgbnd.dcx.json
export interface ERMessageDataset {
    [fmgFilename: string]: {
        [messageId: string]: string;
    }
};
