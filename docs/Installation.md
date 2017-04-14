# Installation 

**Local installation of the chrome extension**

1. At first you have to download extension from this repository. *( via GIT or by direct download )*
2. Open Chrome and go to URL `chrome://extensions/`
3. Check `Developer mode` option *( top right corner )*
4. Click on `Load unpacked extension` button
5. Navigate to folder where you downloaded *( cloned )* the extension


**Configuration of the extension**

Perfect. At this moment extension is installed in Google Chrome.
 
1. Open new tab. *( by clicking on "new tab" button or hitting `ctrl+t` )*
2. *You were redirected to options page ...*
3. Fill required credentials : 
  * Redmine URL
  * Redmine API key
4. Save options *( big green save button at the bottom )*
5. Open new tab again. Now you should see Redmine tasks assigned to you.
6. To use [omnibox features](Omnibox.md) go to options page and click on button with text *"There is no parsed projects yet. Please click here to parse them."* in section *"Project data retrieve ( Omnibox functionality )"*


## Installation for advanced users
If you know how to use GIT versioning control, you can download extension 
files with command 

	`git clone https://github.com/ekalinak/redmine-home.git`

After this, you can continue installation from *point 2*.

**Benefit** from this approach is, that you can easily update extension when there will 
be new version of it. You have to just navigate to folder where you cloned the extension 
and run 

	`git pull` 

command.
