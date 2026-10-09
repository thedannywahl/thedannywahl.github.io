---
title: Reconsidering Custom Renderers
published_at: 2012-04-11T09:45:59.000Z
modified_at: 
snippet: 
tags: Moodle
authors: Danny Wahl
---

One of the coolest new features in Moodle 2 is the fact that the core uses a
series of renderes to output the final HTML, and that these renderers can
extended or even overwritten by a plugin. One of the first things that people
did was take the custommenu renderer and extend it to include theme-specific
menu items. I think the first person to do this was
[Mary Evans](http://moodle.org/user/profile.php?id=713800) (currently) of New
School Learning in her theme
[Aardvark Makeover](http://moodle.org/mod/forum/discuss.php?d=174281). (note:
please don’t bug Mary if you decide to use that theme, she’s moved on to
[bigger](http://moodle.org/plugins/view.php?plugin=theme_aardvark_postit) and
[better](http://moodle.org/plugins/view.php?plugin=theme_custom_corners) themes)

Of course since Mary did the heaving lifting I figured “Why not?” since I was
currently in process of porting
[Zebra](https://iyware.com/portfolio/zebra-2/ "Zebra 2") to Moodle 2. So some
serious copy-pasta ensued and I had my cool little home icon and calendar in the
custommenu. Now a year later there has been some cool development in the core to
the custommenu and I realized how much I’ve been missing out on by killing YUI
in my renderer, so I decided to rethink my approach.

Here is my original renderers.php:

```php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * zebra theme renderer override functions
 *
 * @package    theme_zebra
 * @copyright  2011 Danny Wahl
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Extends the core renderer
 *
 * Core renderer is extended in order to add extra items to the custom menu
 */
class theme_zebra_core_renderer extends core_renderer {

    /**
     * Renders a custom menu object (located in outputcomponents.php)
     *
     * The custom menu this method override the render_custom_menu function
     * in outputrenderers.php
     * @staticvar int $menucount
     * @param custom_menu $menu
     * @return string
     */
    protected function render_custom_menu(custom_menu $menu) {
        $branchlabel = "&nbsp;";
        $branchurl   = new moodle_url('/index.php');
        $branchtitle = get_string('menuhome','theme_zebra');
        $branchsort  = -1;
        $branch = $menu->add($branchlabel, $branchurl, $branchtitle, $branchsort);

        $branchlabel = date("F j, Y");
        $branchurl   = new moodle_url('/calendar/view.php');
        $branchtitle = get_string('menutoday','theme_zebra');
        $branchsort  = +10000;
        $branch = $menu->add($branchlabel, $branchurl, $branchtitle, $branchsort);

        // If the menu has no children return an empty string
        if (!$menu->has_children()) {
            return '';
        }
        // Initialise this custom menu
        $content = html_writer::start_tag('ul', array('class'=>'dropdown dropdown-horizontal'));
        // Render each child
        foreach ($menu->get_children() as $item) {
            $content .= $this->render_custom_menu_item($item);
        }
        // Close the open tags
        $content .= html_writer::end_tag('ul');
        // Return the custom menu
        return $content;
    }

    /**
     * Renders a custom menu node as part of a submenu
     *
     * The custom menu this method override the render_custom_menu_item function
     * in outputrenderers.php
     *
     * @see render_custom_menu()
     *
     * @staticvar int $submenucount
     * @param custom_menu_item $menunode
     * @return string
     */
    protected function render_custom_menu_item(custom_menu_item $menunode) {
        // Required to ensure we get unique trackable id's
        static $submenucount = 0;
        $content = html_writer::start_tag('li');
        if ($menunode->has_children()) {
            // If the child has menus render it as a sub menu
            $submenucount++;
            if ($menunode->get_url() !== null) {
                $url = $menunode->get_url();
            } else {
                $url = '#cm_submenu_'.$submenucount;
            }
            $content .= html_writer::start_tag('span', array('class'=>'customitem'));
            $content .= html_writer::link($url, $menunode->get_text(), array('title'=>$menunode->get_title()));
            $content .= html_writer::end_tag('span');
            $content .= html_writer::start_tag('ul');
            foreach ($menunode->get_children() as $menunode) {
                $content .= $this->render_custom_menu_item($menunode);
            }
            $content .= html_writer::end_tag('ul');
        } else {
            // The node doesn't have children so produce a final menuitem
            if ($menunode->get_url() !== null) {
                $url = $menunode->get_url();
            } else {
                $url = '#';
            }
            $content .= html_writer::link($url, $menunode->get_text(), array('title'=>$menunode->get_title()));
        }
        $content .= html_writer::end_tag('li');
        // Return the sub menu
        return $content;
    }

    /**
     * Copied from core_renderer with one minor change
     *
     * Changes $this->output->render() to $this->render()
     */
    protected function render_navigation_node(navigation_node $item) {
        $content = $item->get_content();
        $title = $item->get_title();
        if ($item->icon instanceof renderable && !$item->hideicon) {
            $icon = $this->render($item->icon);
            $content = $icon.$content;
        }
        if ($item->helpbutton !== null) {
            $content = trim($item->helpbutton).html_writer::tag('span', $content, array('class'=>'clearhelpbutton'));
        }
        if ($content === '') {
            return '';
        }
        if ($item->action instanceof action_link) {
            $link = $item->action;
            if ($item->hidden) {
                $link->add_class('dimmed');
            }
            $content = $this->render($link);
        } else if ($item->action instanceof moodle_url) {
            $attributes = array();
            if ($title !== '') {
                $attributes['title'] = $title;
            }
            if ($item->hidden) {
                $attributes['class'] = 'dimmed_text';
            }
            $content = html_writer::link($item->action, $content, $attributes);

        } else if (is_string($item->action) || empty($item->action)) {
            $attributes = array();
            if ($title !== '') {
                $attributes['title'] = $title;
            }
            if ($item->hidden) {
                $attributes['class'] = 'dimmed_text';
            }
            $content = html_writer::tag('span', $content, $attributes);
        }
        return $content;
    }
}
```

And here’s the call in the page layout general.php:

```php
<?php if ($hascustommenu) { ?>
    <div id="custommenu-wrapper">
        <div id="custommenu"><?php echo $custommenu; ?></div>
    </div>
<?php } ?>
```

That is a lot of work just to add a list-item to the beginning of a list. And as
I said, you totally lose all the cool YUI injected classes on the custommenu.
One other thing I wanted to do was explore adding a setting to turn the home/cal
links on and off and to allow the date to be customized. Frankly I don’t know
how (or if it’s even possible) to call a theme setting inside of a renderer.

Anyways, here’s what it looks like now: renderers.php has been deleted! And the
call in general.php looks like this now:

```php
<?php if ($hascustommenu) { ?>
    <div id="custommenu-wrapper">
        <div id="custommenu">
            <a class="home" href="<?php echo new moodle_url('/index.php'); ?>">
                <div>&nbsp;</div>
            </a>
            <?php echo $custommenu; ?>
            <a class="calendar" href="<?php echo new moodle_url('calendar/view.php'); ?>">
                <?php echo date("F j, Y"); ?>
            </a>
        </div>
    </div>
<?php } ?>
```

So now the Home link and calendar link are simply hrefs inside the custommenu
div. They’re not list-items any more, but they never really needed to be. And
now I have the flexibility to customize their output with settings and have the
full power of the YUI custommenu. So the moral of this story is: Just because
you can override a core renderer doesn’t mean you should.
