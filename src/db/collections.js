let collections = {};

export const initCollections = (db) => {
    collections = {
        profileCollection: db.collection("user"),
        ideaCollection: db.collection("ideas"),
        categoryCollection: db.collection("categories"),
        commentCollection: db.collection("comments"),
    };
};

export const getCollections = () => collections;