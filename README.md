# SpotifyLikesReorder
Currently, you can't reorder your liked songs on Spotify. Now you can.

## Plan
* Use the Spotify API to manipulate a user's liked songs so that they can be in a user specified order
  * Liked songs appear in the order they were liked, where the newest liked song appears first
  * Reorder the songs in the specified order by deleting/readding songs from liked songs
* Create a UI where the user can drag-and-drop their liked songs in any order

## Research
* Need to allow user to login to their Spotify account
* Is there a maximum limit for the number of liked songs the API can return?
* Use node.js?

## Reference
[Get a user's liked songs](https://developer.spotify.com/documentation/web-api/reference/library/get-users-saved-tracks/)

[Delete a song from a user's liked songs](https://developer.spotify.com/documentation/web-api/reference/library/remove-tracks-user/)

[Add a song to a user's liked songs](https://developer.spotify.com/documentation/web-api/reference/library/save-tracks-user/)
