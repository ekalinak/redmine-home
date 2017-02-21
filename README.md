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
* omnibox quick access _( documented in [Omnibox manual](docs/Omnibox.md) )_

There are also planned features, which aren't implemented yet. You can find them in [planned featuers document](docs/Planned-features.md).

If you will find any kind of bug during using this extension, feel free to create [issue on GitHub](https://github.com/ekalinak/redmine-home/issues?q=is%3Aopen+is%3Aissue)

## Installation
Extension is not available to install via Chrome Web store. Instead of this, you have to install this extension locally.
 
Step by step tutorial you can find in [Installation document](docs/Installation.md).


## Data saving 
Currently extension saves data to *localStorage* and also to Chrome sync storage.

Chrome sync storage ensures you don't have to configure extension on multiple machines. *( settings are synced between workstations )*

More about Chrome sync storage [here](https://developer.chrome.com/extensions/storage).

## Used technologies 

* [jQuery](https://github.com/jquery/jquery-dist.git)
* [Bootstrap](https://github.com/twbs/bootstrap) 
* [knockoutJs](http://knockoutjs.com/)
* [textile.js](http://www.ben-daglish.net/textile/textile.js)

