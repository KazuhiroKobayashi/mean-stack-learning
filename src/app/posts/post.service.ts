import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];
  private postUpdated = new Subject<Post[]>();

  constructor(public http: HttpClient) {}

  getPosts(): void {
    this.http
      .get<{
        message: string;
        posts: { _id: string; title: string; content: string }[];
      }>('http://localhost:3000/api/posts')
      .pipe(
        map((postData) => {
          return postData.posts.map((post) => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
            };
          });
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener(): Observable<Post[]> {
    return this.postUpdated.asObservable();
  }

  getPost(
    id: string
  ): Observable<{ _id: string; title: string; content: string }> {
    return this.http.get<{ _id: string; title: string; content: string }>(
      'http://localhost:3000/api/posts/' + id
    );
  }

  addPost(title: string, content: string): void {
    const post: Post = { id: '', title, content };
    this.http
      .post<{ message: string; postId: string }>(
        'http://localhost:3000/api/posts',
        post
      )
      .subscribe((responseData) => {
        post.id = responseData.postId;
        this.posts.push(post);
        this.postUpdated.next([...this.posts]);
      });
  }

  updatePost(id: string, title: string, content: string): void {
    const updatedPost: Post = { id, title, content };
    this.http
      .put('http://localhost:3000/api/posts/' + updatedPost.id, updatedPost)
      .subscribe((response) => {
        const postIndex = this.posts.findIndex(
          (post) => post.id === updatedPost.id
        );
        this.posts[postIndex] = updatedPost;
        this.postUpdated.next([...this.posts]);
      });
  }

  deletePost(postId: string): void {
    this.http
      .delete<{ message: string }>('http://localhost:3000/api/posts/' + postId)
      .subscribe((responseData) => {
        console.log(responseData.message);
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.posts = updatedPosts;
        this.postUpdated.next([...this.posts]);
      });
  }
}
