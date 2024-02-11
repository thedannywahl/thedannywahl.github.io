---
title: Adding Custom Images in Moodle 2.0 Themes
published_at: 2011-11-17T10:59:46.000Z
modified_at: 
snippet: Moodle 2.0 has much more flexibility when it comes to themes.  But the documentation is a little sparse.
tags: Moodle
authors: Danny Wahl
---

Moodle 2.0 introduced the ability for a theme to plug in a custom settings page and allow an administrator to change some settings. Moodle 2.0 also introduced a new image renderer that uses an output function. I wanted to allow a user to use either format in a setting, and for it to be as transparent to the user as possible. Thanks to a pointer from [Richard Oelmann](http://moodle.org/user/view.php?id=480148&course=5) I was able to do just that. Here’s a short walkthrough of the files necessary and the functions to allow a user to set a custom image, using any format.

The basic assumption here is that we’re going to be creating a new theme called “Your Theme” (fitting enough). I’m also going to assume that you’ve read the [Moodle Docs](http://docs.moodle.org/) about [creating a new theme](http://docs.moodle.org/dev/Themes_2.0_creating_your_first_theme), or [cloning a theme](http://docs.moodle.org/dev/Themes_2.0_how_to_clone_a_Moodle_2.0_theme) so we’ll be ignoring things like config.php, lang strings, etc… where it’s not necessary.

## Language Strings

The most important thing you need to do is document what you’re expecting the user to do. Seriously. It’s two lines of code, please at least just copy and paste! The user needs to know what you expect them to do. Here we’re adding two strings: `imageurl` and `imageurldesc`. The first is the label that will be called in the settings page, the second is the description for the setting. I like to start with the language strings because having unused strings in your theme won’t cause an error, but calling undefined strings definitely will.

```php
// lang/en/theme_yourtheme.php

$string['imageurl'] = 'Image URL';
$string['imageurldesc'] = '<p>Input the URL to your image.</p>
							<p>This can be used in one of three protocol types:
								<ul>
									<li>
										<p>Moodle Output (relative to theme):</p>
										<p>
logo/companylogo
										</p>
									</li>
									<li>
										<p>Full path:</p>
										<p>
http://domain.com/theme/image.php?theme=yourtheme&image=logo&rev=1&component=theme
											<br />
http://domain.com/path/to/image.jpg
										</p>
									</li>
									<li>
										<p>Relative Path:</p>
										<p>
/path/to/file/companylogo.png
										</p>
									</li>
								</ul>
							</p>';
```

## Library Functions

The second place I go is to add the function, again, having uncalled functions will not cause an error, but calling undefined functions definitely will.

The first function we’re going to call is our processor. This function calls all the sub-functions, so if you already have this top level function, we’re going to extend it, not define it. This function does the following three or four steps.

1.  get the current value of the setting if it’s empty/unset
2.  set the value as `null`
3.  send the value to the post-processor
4.  return the value.

```php
// lib.php
/**
 * This is the postprocess function for themes
 *
 * @param string $css Incoming CSS to process
 * @param stdClass $theme The theme object
 * @return string The processed CSS
 */
function yourtheme_process_css($css, $theme) {
    //Get the path to the image url from settings
    if (!empty($theme->;settings->;imageurl)) {
        $imageurl = $theme->;settings->;imageurl; //A setting exists, let's store that
    } else {
        $imageurl = null; //No setting found
    }
    $css = yourtheme_set_imageurl($css, $imageurl); //Send the value to the post processor

    //Do not return until all above sub-functions have been processed
    return $css;
}
```

The next function is the actual post-processor. Each setting will need its own post-processor because everything needs to be handled differently. This function does several things, but basically we’re using [`strpos()`](http://php.net/manual/en/function.strpos.php) to determine the image type – and by type I don’t mean meta, I mean if it’s using Moodle Output, full path, or relative path. Basically we’re using nested `if`s to strip away the options to see if we need to modify the setting before we post-process it. The only one that requires modification is Moodle Output, so we do 2 checks to make sure that it’s not that first.

```php
// lib.php
/**
 * Sets the image url
 *
 * @param string $css
 * @param mixed $imageurl
 * @return string
 */
function yourtheme_set_imageurl($css, $imageurl) {
    global $OUTPUT;
    $tag = '[[setting:imageurl]]'; //This is the setting that is being post-processed, all instances in CSS will be replaced
    $replacement = $imageurl; //Grab the value that was passed from above (setting or null)
    if (is_null($replacement)) { //The setting is null or undefined, use the default
        $replacement = $OUTPUT->pix_url('logo/logo', 'theme'); //This is the default value
    }
    else { //The setting is not null
       $protocol = '://';
        $ntp = strpos($replacement, $protocol); //Check to see if a networking protocol is used (http/s, etc...)
        if($ntp === false) { //Networking protocol used, keeping the user set value
            $relative = '/';
            $rel = strpos($replacement, $relative); //Check to see if a relative path is used (leading slash)
            if($rel !== 0) { //Starts with a slash, keeping the user set value
                $replacement = $OUTPUT->pix_url("$imageurl", 'theme'); //Using Moodle output, send to pix_url() and store the returned value
            }
        }
    }
    $css = str_replace($tag, $replacement, $css); //Replace the tag with our new value (user input or pix_url() output)
    return $css; //Send it back to the main function
}
```

### Settings

Now that we’ve got the back end setup we’re going to present the user with the settings. This starts with some simple security checks to make sure that only the right people can access your settings at the right times (contexts). Then it creates the setting, in this case we’re adding a text-box that’s going to be sanity checked by Moodle based on the assumption that it’s a URL that’s being input. Finally it takes the setting and stores it.

```php
// settings.php
/**
 * Your Theme theme settings page
 *
 * @package    theme_yourtheme
 * @copyright  2011 Danny Wahl
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
defined('MOODLE_INTERNAL') || die;

if ($ADMIN->fulltree) {
    //Set the path to the image url
    $name = 'theme_yourtheme/imageurl'; //Give this setting a name
    $title = get_string('imageurl','theme_yourtheme'); //Display the title from the language strings
    $description = get_string('imageurldesc', 'theme_yourtheme'); //Display the description from the language strings
    $setting = new admin_setting_configtext($name, $title, $description, 'logo/logo', PARAM_URL); //Create the setting, include the default so users know what's happening if they reset the value
    $settings->add($setting);
}
```

### Style Sheets

Finally we need to actually have something that we want to process. You don’t have to call this last file custom.css, you can use whatever you want, all we need is a place to put our tag that we’re going to process. For this example we’re going to change the body background image. Don’t forget to use the new [Moodle CSS Coding Style](http://docs.moodle.org/dev/CSS_coding_style)!

```css
/* style/custom.css */
body {
    background: url([[setting:imageurl]]) no-repeat scroll center top transparent;
}
```

Now wherever that tag (shortcode for you WordPress people) `[[setting:imageurl]]` is used it will be replaced with our setting, and if the user setting is null it will be replaced with our default value.

### Notes

Finally, it’s possible to add as many and as wild of settings as you want – just be smart about naming them. In this example `imageurl` was to describe to you what we were going to do, but if you’re replacing 3 or 4 or 10 different images, then maybe something like `bodybgurl` would make more sense. Also you can really allow some flexibility with ease of use for the end user. Think about this example:

```css
/* style/custom.css */
body {
    background: url([[setting:bodybgurl]]) [[setting:bodybgrepeat]] [[setting:bodybgscroll]] [[setting:bodybgposition]] [[setting:bodybgcolor]];
}
```

That’s a lot of flexibility. From a UX perspective you can create dropdowns using `admin_setting_configselect()` and a YUI color selector. Of course at this level your lib.php is getting pretty large. Maybe this option would be just as flexible for the end user, but require less of a programmer:

```css
/* style/custom.css */
body {
    background: [[setting:bodybackground]];
}
```

Now the user can input `url(/path/to/image.jpg) fixed bottom center red` or just `blue` or whatever – but it does allow them more options to break it!