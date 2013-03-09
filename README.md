Hey Crashlytics!

- The number of issues per page is modular, and will accept any input, defaulting to 25;
- Individual issue viewer: I opted not to implement an entirely new page for the 
  individual viewer. Entering an issue's hash number will cause its full view to appear as a page overlay.
  e.g., the URL: ./issues/#9625 will display an issue full view box. Change it to ./issues/9630, and it will change without a page reload.
  If the hash is not a number in the current 30 issues, an ajax call will be issued and the issue will be overlaid anyway, assuming it exists.
- Use the right and left arrow keys to navigate pages.