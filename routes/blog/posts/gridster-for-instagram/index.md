---
title: Gridster for Instagram
published_at: 2015-10-17T22:09:53.000Z
modified_at: 
snippet: Gridster for instagram is the easiest way to get a customized, full-screen, display of any instagram feed.
tags: 
authors: Danny Wahl
---

Gridster for instagram is the easiest way to get a customized, full-screen, display of any instagram feed. As its name implies, Gridster loads the images you want into a photo wall and animates through them.

## Installation

Navigate to the `assets/js` folder open the `Gridster.js` file and enter your [clientID](https://instagram.com/developer/clients/manage/) on line 1.

## Usage

Simply open in your browser and Gridster will display the most popular images on instagram. Click on the hashtag to enter full-screen mode.

## Customization

There are two ways to customize the output of Gridster, the first is with the URL query string and the second is by editing Gridster.js

### Query String

There are a number of options that you can use to customize the display of Gridster using the query string.

*   tag: You can use `tag=tagname` to show a specific tag from instagram. If no tag is provided, images from the "popular page" are displayed. You don't need to add "#" at the beginning, just the name of the tag. \[default: null\]
*   images: You can use `images=##` to set how many images to fetch (maximum 60). \[default: 60\]
*   speed: You can use `speed=##` to control the speed in seconds of the animation transitions between images. \[default: 1\]
*   pause: You can use `pause=##` to control the time in seconds the scroll pauses between animations. \[default: 10\]
*   reload: You can use `reload=##` to control the time in minutes Gridster waits to get new images from instagram. \[default: 60\]
*   sort: You can use `sort=none` to control the order in which the images are sorted on the page. Available sort options are: none, most-recent, least-recent, most-liked, least-liked, most-commented, least-commented, and random. \[default: none\]
*   animation: You can use `animation=scale` to control the animation type used to transition between images. Available animation options are: showhide, fadeinout, slideleft, slideright, slidetop, slidebottom, rotateleft, rotateright, rotatetop, rotatebottom, scale, rotate3d, rotateleftscale, rotaterightscale, rotatetopscale, rotatebottomscale, and random. \[default: random\]
*   rows: You can use `rows=##` to specify the number of rows in the grid. \[default: 3\]
*   columns: You can use `columns=##` to specify the number of columns in the grid. If the total images in rows multiplied by columns is more than specified in "images" then Gridster will subtract columns until the grid is full. \[default: 4\]
*   step: You can use `step=##` or `step=random` to control the number of animations that occur simultaneously. \[default: random\]
*   maxstep: If step is set to "random" you can set `maxstep=##` to control the maximum amount of animations that occur at once. \[default: 2\]
*   author: You can use `author` to display the username of the person who posted the picture. \[default: null\]
*   caption: You can use `caption` to display the caption that was originally posted with the image (including hashtags) \[default: null\]
*   comments: You can use `comments` to display the comment count on the image. \[default: null\]
*   likes: You can use `likes` to display the number of likes on an image. \[default: null\]
*   link: You can use `link` so that clicking the image will take the user to the image post on instagram. \[default: null\]
*   background: You can use `background=red` to change the default background color. If you use hex or rgb be sure to encode the URL. \[default: null\]
*   color: You can use `color=purple` to change the default font color. If you use hex or rgb be sure to encode the URL (# is %23). \[default: null\]
*   clientid: You can use `clientid=##` to provide or override a clientID inserted in Gridster.js. \[default: null\]

### Gridster.js

Most of the variables that control the output of Gridster are in the `urlParams{}` object. Simply change the default values that you want. If you don't want users to be able to modify the output with the query string then at the top of Gridster.js set `enableQuery = false;` and only the settings from the js file will be used.

## Examples

`?tag=spring&author&sort=random`: Display 60 large images all tagged "spring" with the username displayed, randomly displaying them in the grid.

`?sort=most-liked&speed=0&refresh=5&likes&link`: Display a small grid that doesn't animate of the most popular images on instagram that refreshes every 5 minutes, sorted by likes and you can click to see the original on instagram.

`?tag=tbt&author&likes&comments&caption`: See who's throwing back and what they have to say about it.

## License

Gridster is built using a combination of open source and proprietary code. The individual licenses for each open source component can be found in the LICENSE folder.

### Main

Gridster for Instagram is copyright 2015 Danny Wahl, all rights reserved except where specified in the LICENSE file.

### Vendor

* [Animated Responsive Image Grid](http://tympanus.net/codrops/2012/08/02/animated-responsive-image-grid/) | © Tympanus | Tympanus License
* [HTML 5 Boilerplate](https://html5boilerplate.com/) | © HTML 5 Boilerplate | MIT License
* [Instafeed.js](http://instafeedjs.com/) | © Steven Schobert | MIT License
* [jQuery](https://jquery.org/) | © jQuery Foundation and other contributors | MIT License
* [Modernizr](http://modernizr.com/) | © Faruk Ateş | MIT License
* [Normalize.css](http://necolas.github.io/normalize.css/) | © Nicolas Gallagher and Jonathan Neal | MIT License
* [Screenfull.js](http://sindresorhus.com/screenfull.js/) | © Sindre Sorhus | MIT License

## Changelog

* 1.1
  * Content reload doesn't exit fullscreen anymore
  * readme now written in html
* 1.0
  * Initial release


[Download Gridster for Instagram](https://github.com/thedannywahl/gridster)