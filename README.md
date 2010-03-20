Form Follows Function - a jQuery Plugin
=======================================

> Form follows function - that has been misunderstood. Form and function should be one, joined in a spiritual union.
>
> Frank Lloyd Wright, 1908 - US architect (1869 - 1959)


What is it about?
-----------------

`jquery.form-follows-function.js` is a jQuery plugin which replaces common webform components with a nicer, more functional html proxy component. 

This is because common form elements like selectboxes are very limited to style via CSS and need a more enhanced functionality.

Right now there is only a replacement for selectboxes. More will follow!


Features
--------

### Selectbox Features

* Respects tabindex, selected and disabled attributes.
* Truncation of selected text for selectboxes with a fixed width.
* Options may also be defined individually via class-attribute keywords.
* Selectboxes are styled via CSS only to give you the most freedom.
* Optionally include label within selectbox as a hint.
* Access selectbox and options via keys.
* Replaced selectbox clones attached events from original selectbox.


Usage
-----

Example of implementation (will replace all selectboxes within a form):

    <script type="text/javascript" src="jquery.form-follows-function.js"></script>
    
    <script type="text/javascript">
    $(function(){
	    $('form').fff();
    });
    </script>

