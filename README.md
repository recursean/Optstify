# Optstify
Currently, you can't reorder your saved songs on Spotify. Now you can.

## Plan
* Use the Spotify API to manipulate a user's saved songs so that they can be in a user specified order
  * Saved songs appear in the order they were saved, where the newest saved song appears first
  * Reorder the songs in the specified order by deleting/readding songs from saved songs
* Create a UI where the user can drag-and-drop their saved songs in any order

## Research
* Need to allow user to login to their Spotify account
* Is there a maximum limit for the number of liked songs the API can return? - No
* Use node.js?

## POC
* Once in cloned repo, install dependencies:
```
npm install
```

* Run server
```
node server.js
```

* Browse to localhost:8080

## Reference
[Get a user's liked songs](https://developer.spotify.com/documentation/web-api/reference/library/get-users-saved-tracks/)

[Delete a song from a user's liked songs](https://developer.spotify.com/documentation/web-api/reference/library/remove-tracks-user/)

[Add a song to a user's liked songs](https://developer.spotify.com/documentation/web-api/reference/library/save-tracks-user/)
