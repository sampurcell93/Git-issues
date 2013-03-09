Hey Crashlytics!

- The number of issues per page is modular, and will accept any input, defaulting to 25;
- Individual issue viewer: I opted not to implement an entirely new page for the 
  individual viewer. Entering an issue's hash number will cause its full view to appear as a page overlay.
  e.g., the URL: ./issues/#9625 will display an issue full view box. Change it to ./issues/#9630, and it will change without a page reload.
  If the hash is not a number in the current 30 issues, an ajax call will be issued and the issue will be overlaid anyway, assuming it exists.
- Use the right and left arrow keys to navigate pages.

My rationale for the integrated overlay is that it's much easier to reference issues quickly with the hash method. If a developer wants an issue's json,
they can query github's api anyway - this decision was based on ease for a user.

Things done wrong: My github user parser doesn't check for user validity. The rationale here is that in the worst case (IE a long list of tags), I would have to issue 
too many ajax calls, and the page's load speed would be affected. I am still thinking of an efficient way to do this.

Thanks for giving me the opportunity to work on this challenge. It was great fun and a wonderful learning experience.