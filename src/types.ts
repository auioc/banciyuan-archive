export type StringKV = { [x: string]: string };

type ItemIndex = { id: string; type: number; user: number; time: number };

type ItemTagIndex = { id: number; type: number; name: string; count: number };

type UserIndex = { id: number; name: string; sex: number; count: number };

type UserTagIndex = { id: number; name: string; count: number };

export type IndexData = {
    item: ItemIndex;
    itemtag: ItemTagIndex;
    user: UserIndex;
    usertag: UserTagIndex;
};

type ItemDetail = {
    id: string;
    type: number;
    time: number;
    user: number;
    content: string;
    tags: number[];
    images: {
        id: number;
        name: string;
        format: number;
        w: number;
        h: number;
        size: number;
    }[];
};

type ItemTagDetail = {
    id: number;
    type: number;
    name: string;
    items: string[];
};

type UserDetail = {
    id: number;
    sex: number;
    names: string[];
    tags: number[];
    items: string[];
};

type UserTagDetail = {
    id: number;
    name: string;
    users: number[];
};

export type DetailData = {
    item: ItemDetail;
    itemtag: ItemTagDetail;
    user: UserDetail;
    usertag: UserTagDetail;
};

export type TYPE = keyof IndexData & keyof DetailData;
