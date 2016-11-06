# Redmine home
Google Chrome extension which replaces "new tab" screen with assigned redmine issues.

Extension does not try to replace Redmine system. Main idea is to get quick overview what tasks user have assigned without checking Redmine system itself.

**Features** 
* Display assigned tasks to logged user
* Auto update status of the assigned tasks
* Sort tasks
* Search in tasks
* Various links to Redmine system
* Choose from various bootstrap themes
* View task details _( beta )_

**Planned features not implemented yet**
* Add custom time tracking *( time data will be possible to send to Redmine system )*
* ToDo list
* Add link to original Chrome "new tab" page. 
* Create an option to choose if "Chrome sync storage" should be used.
* Authentication via HTTP *( currently possible only via API key )* 

## Installation
Extension is not available to install via Chrome Web store. Instead of this, you have to install this extension locally: 

 
1. At first you have to download extension from this repository. *( via GIT or by direct download )*
2. Open Chrome and go to URL `chrome://extensions/`
3. Check `Developer mode` option *( top right corner )*
4. Click on `Load unpacked extension` button
5. Navigate to folder where you downloaded *( cloned )* the extension

---

Perfect. At this moment extension is installed in Google Chrome.
 
6. Open new tab. *( by clicking on "new tab" button or hitting `ctrl+t` )*
7. *You were redirected to options page ...*
8. Fill required credentials : 
  * Redmine URL
  * Redmine API key
9. Save options *( big green save button at the bottom )*
10. Open new tab again. Now you should see Redmine tasks assigned to you.


## Data saving 
Currently extension saves data to *localStorage* and also to Chrome sync storage.

Chrome sync storage ensures you don't have to configure extension on multiple machines. *( settings are synced between workstations )*

More about Chrome sync storage [here](https://developer.chrome.com/extensions/storage).

## Used technologies 

* [jQuery](https://github.com/jquery/jquery-dist.git)
* [Bootstrap](https://github.com/twbs/bootstrap) 
* [knockoutJs](http://knockoutjs.com/)
* [textile.js](http://www.ben-daglish.net/textile/textile.js)

