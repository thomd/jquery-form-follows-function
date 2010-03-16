Form Follows Function - a jQuery Plugin
=======================================

> Form follows function - that has been misunderstood. Form and function should be one, joined in a spiritual union.
>
> Frank Lloyd Wright, 1908  
> US architect (1869 - 1959)


What is it about?
-----------------

`jquery.form-follows-function.js` is a jQuery plugin which replaces common webform components with a nicer, more functional html proxy component. 

This is because common form elements like selectboxes are very limited to style via CSS and need a more enhanced functionality.

Right now there is only a replacement for selectboxes. More will follow!


Features
--------

### Selectbox Features

* respects tabindex, selected and disabled attributes.
* truncation of selected text for selectboxes wirh a fixed width.
* controll plugin-options via special class-attribute keywords also.
* style selectbox via css.
* include label within selectbox.
* access selectbox via keys.
* enhance selectbox-functionality with callbacks.
* replaced selectbox uses attached events from original selectbox.


Usage
-----

Example of implementation:

    <script type="text/javascript" src="jquery.form-follows-function.js"></script>
    
    <script type="text/javascript">
    $(function(){
	    $('form').fff();
    });
    </script>

