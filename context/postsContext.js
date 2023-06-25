import React, {createContext, useCallback, useReducer, useState} from 'react';

const PostsContext = createContext({});

function postsReducer(state, action){
    switch (action.type) {
        case "addPosts":
            const newPosts = [...state];
            // check if the new posts are already in the array
            action.posts.forEach((post) => {
                if (!newPosts.find((p) => p._id === post._id)) {
                    newPosts.push(post);
                }
            });
            return newPosts; // append new posts to the end of the array
            // return [...state, action.payload];
        case "deletePost":
            return state.filter((post) => post._id !== action.postId);
            //return state.filter((post) => post._id !== action.payload);
        default:
            return state;
    }
}

export const PostsProvider = ({ children }) => {
    const [posts, dispatch] = useReducer(postsReducer, []);
    const [haveNoMorePosts, setHaveNoMorePosts] = useState(false);

    const deletePost = useCallback(async (postId) => {
        dispatch({
            type: "deletePost",
            postId,
        });
    },[]);

    const setPostsFromSSR =useCallback((postsFromSSR = []) => {
       dispatch({
          type: "addPosts",
          posts: postsFromSSR,
       })
    },[]);

    const getPosts = useCallback(async (args) => {
        const {lastPostDate, getNewerPost=false} = args;
        const result = await fetch("/api/getPosts", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({lastPostDate, getNewerPost}),
        });
        const json = await result.json();
        const postsResult = json.posts || [];
        console.log("(Client Side) getPosts - postsResult:", postsResult);
        if (postsResult.length < 5) {
            setHaveNoMorePosts(true); // no more posts to load. reach the end of the list in the database
        }
        dispatch({
            type: "addPosts",
            posts: postsResult,
        })
    },[]);

    return (
        <PostsContext.Provider value={{ posts, setPostsFromSSR,getPosts, haveNoMorePosts, deletePost }}>
            {children}
        </PostsContext.Provider>
    )
}

export default PostsContext;