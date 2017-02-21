# Omnibox 
Extension also provides [chrome omnibox](https://www.chromium.org/user-experience/omnibox) support. Key word for omnibox activation is **red** _( abbreviation for "Redmine" )_

Omnibox provides quick jump to projects pages or issues in Redmine. 
 
## Parsing projects locally
 Before you can start using omnibox functionality, you have to parse all projects which you are assigned to to your local machine. 
 
 To do that, you have to go to ***Options*** and click on button ***"Parse projects locally"*** in "Project data retrieve" section.

## Activating and searching in omnibox
After you projects are parsed, you can activate omnibox by clicking on any webpage to URL bar and type **red**. After that you should hit **TAB** and omnibox for Redmine is activated

Now you can start type name of projects you want to quick jump into. If there is positive match against your locally parsed projects, you should see it in suggest options of omnibox.
 

## Features of omnibox
If you select _( by arrows )_ one of suggested options and you hit enter, you will be redirected to _project overview_ page
 
### Show particular part of project
If you want to show directly particular part of the project _( i.e. Issues )_, after you select by arrow keys your project, hit *space* key and then continue typing which part you want to go. There are several options you may navigate to : 

* activity
* issues
* news
* wiki
* repository
* settings

***Pattern***

```
project-name [issues|repository|wiki|...]
```

### Access directly to issue
After omnibox is activated, you can write directly ***"issue"*** _( no project name, just type "issue" )_, then add space and then number of task/issue in Redmine. When you hit the enter key, you will be redirected directly to that issue.

***Pattern***

```
issue 1234
```