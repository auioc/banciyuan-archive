export type StringKV = { [x: string]: string };

type ItemIndex = Readonly<{
    id: string;
    type: number;
    user: number;
    time: number;
}>;

type ItemTagIndex = Readonly<{
    id: number;
    type: number;
    name: string;
    count: number;
}>;

type UserIndex = Readonly<{
    id: number;
    name: string;
    sex: number;
    count: number;
}>;

type UserTagIndex = Readonly<{ id: number; name: string; count: number }>;

export type IndexData = Readonly<{
    item: ItemIndex;
    itemtag: ItemTagIndex;
    user: UserIndex;
    usertag: UserTagIndex;
}>;

export type ID<T extends TYPE> = IndexData[T]['id'];

type ItemDetail = Readonly<{
    id: string;
    type: number;
    time: number;
    user: number;
    content: string;
    tags: number[];
    images: Readonly<{
        id: number;
        name: string;
        format: number;
        w: number;
        h: number;
        size: number;
    }>[];
}>;

type ItemTagDetail = Readonly<{
    id: number;
    type: number;
    name: string;
    items: string[];
}>;

type UserDetail = Readonly<{
    id: number;
    sex: number;
    names: string[];
    tags: number[];
    items: string[];
}>;

type UserTagDetail = Readonly<{
    id: number;
    name: string;
    users: number[];
}>;

export type DetailData = Readonly<{
    item: ItemDetail;
    itemtag: ItemTagDetail;
    user: UserDetail;
    usertag: UserTagDetail;
}>;

export type TYPE = keyof IndexData & keyof DetailData;
