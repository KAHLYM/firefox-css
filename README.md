<h1 align="center">
  <br>
    <img src="https://github.com/KAHLYM/firefox-css/blob/main/resources/icons/icon.png?raw=true" alt="logo" width="200">
  <br>
  An environment to develop Firefox CSS
  <br>
  <br>
</h1>

<h4 align="center">Develop your CSS for Firefox from VS Code.</h4>

A Visual Studio Code extension to provide an environment to develop Firefox `userChrome.css`.

###  Features

#### Snippets

CSS snippets are sourced from Mozilla’s [gecko-dev repository](https://github.com/mozilla/gecko-dev), updated daily at 00:00 UTC. Users can select a source branch (beta, master, or release) based on their preference.

#### Launch of Firefox on save

Automatically launch Firefox whenever `userChrome.css` is saved. If Firefox is already open, the existing process can be closed to apply changes before relaunching.

This feature is only supported on Windows. There is no technical reason why this feature cannot support Linux or Mac in future.

#### Manage userChrome.css 

Easily open and existing `userChrome.css` or create if the file does not exist for your chosen Firefox profile. The appropriate profile is likely the most recently modified profile.

This feature is only supported on Windows. There is no technical reason why this feature cannot support Linux or Mac in future.
