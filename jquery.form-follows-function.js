/*
 * Form Follows Function - a jQuery based form replacement
 *
 * @author        Thomas Duerr me@thomd.net
 * @date          04.2009
 * @requirements  jquery v1.3.2
 *
 *
 * Usage:
 * ======
 *   Set css-class 'fff' for a arbitrary tag. This replaces all selectboxes within this tag.
 *   Single selectboxes within may be excluded by setting class="fff-exclude" on a selectbox-element.
 *
 *   You may also set options via class-attributes (see comments on options below for some explanations):
 *     class="fff-ajust-widths"
 *     class="fff-insert-label"
 *     class="fff-truncate-selection"
 *     class="fff-remove-empty-options"
 *     
 *
 *
 *
 * The fff-plugin expects a common selectbox with an optional (correctly linked) label and an optional tabindex. 
 * It respects the option-attributes selected and disabled.
 *
 *   Example:
 *
 *     <form class="fff">
 *       ...
 *       <label for="selectbox_id">Select Color ...</label>
 *       <select id="selectbox_id" name="field_name" tabindex="3">
 *         <option value="v1">option 1</option>
 *         <option value="v2">option 4</option>
 *         <option value="v3" selected="selected">option 3</option>
 *         <option value="v4" disabled="disabled">option 4</option>
 *       </select>
 *       ...
 *     </form>
 *
 *
 *
 * CSS:
 * ====
 *   Use css to style the replaced selectbox considering the following rendered html structure:
 *
 *      <div class="select-replacement">                         <-- $box
 *        <span tabindex="3">Select Color ...</span>             <-- $selector
 *        <ul>                                                   <-- $dropdown
 *          <li>option 1</li>                                    <-- $options   
 *          <li>option 2</li>                                    <-- $options   
 *          <li class="selected">option 3</li>                   <-- $options   
 *          <li class="disabled">option 4</li>                   <-- $options   
 *        </ul>
 *      </div>
 *
 *   When adjusting widths, horizontal-paddings of span and li should be the same!
 * 
 *
 */
(function($){

    // default configuration
    $.fff = {
        defaults: {
            insertLabel: false,           // Try to remove label and put it inside of the $selector. This may also be set by class="fff-insert-label".
            ajustWidths: false,           // Set width of $selector to width of $dropdown (which is determined by its content). This may also be set by class="fff-ajust-widths".
            truncateSelection: false,     // Truncate selected text and add ellipsis (will not truncate on ajustWidths = true).
            keyAccess: true,              // Enable accessing of options via arrow-keys.
            removeEmptyOptions: false,    // allow empty options (text or value is empty).
            zIndexStart: 5000,            // Start value of z-index.
            animate: true,                // Slightly animate $dropdown.
            onDropDown: function(){},     // Callback. may be used for code injection when dropdown is shown.
            onSelectOption: function(){}  // Callback. may be used for code injection when a option is selected.
        }
    };

    // event delegation (http://www.danwebb.net/2008/2/8/event-delegation-made-easy-in-jquery)
    $.delegate = function(rules){return function(ev){var target = $(ev.target);for (var selector in rules){if (target.is(selector)){return rules[selector].apply(this, $.makeArray(arguments));}}};};


    //
    // fff-plugin
    //
    $.fn.extend({   
        fff: function(options){

            //
            // merge defaults and options into settings
            //
            var settings = $.extend({}, $.fff.defaults, options);

            //
            // html builder
            //
            var build = {
                selectbox: function(i){
                    return {
                        from: function(select_orig){

							// set class-based options
							var ajustWidths = select_orig.hasClass('fff-ajust-widths') ? true : settings.ajustWidths;
							var insertLabel = select_orig.hasClass('fff-insert-label') ? true : settings.insertLabel;
							var truncateSelection = select_orig.hasClass('fff-truncate-selection') ? true : settings.truncateSelection;
							var removeEmptyOptions = select_orig.hasClass('fff-remove-empty-options') ? true : settings.removeEmptyOptions;

							// get attached events
							var orig_events = function(){
								return $.data(select_orig[0], "events") || {};
							}
							
                            // start building html for replaced selectbox
                            var box = "<div class='select-replacement'>";
                            
                            // add tabindex
                            var tabIndex = select_orig[0].tabIndex;
                            if(tabIndex == 0){
                                box += "<span class='selector'>";
                            } else {
                                box += "<span class='selector' tabindex='" + tabIndex + "'>";
								select_orig.removeAttr("tabindex");
                            }
                            
                            // set first (selected) option
                            var label = $("label[for='"+select_orig.attr('id')+"']"); 
                            if(insertLabel && label.length > 0){
                                box += label.hide().text();
                            } else {
                                var firstOption = $('option:first', select_orig);
                                box += firstOption.is(':empty') ? '&nbsp;' : firstOption.text();
                            }
                            
                            box += "</span><ul>";
                            
                            // set other options
                            $('option', select_orig).each(function(i){
                                var option = $(this);
                                if(removeEmptyOptions && (option.is(':empty') || option.attr('value') == '')) return;
                                var klass = "option";
                                if(option.attr('selected')) klass += " selected";
                                if(option.attr('disabled')) klass += " disabled";
                                box += "<li class='" + klass + "' ref='" + i + "'>" + option.text() + "</li>";
                            });
                            box += "</ul></div>";
                            var $box = $(box).css({'position': 'relative', 'display': 'inline', 'z-index': (settings.zIndexStart - i)});

                            var $selector = $('span', $box);
                            if(select_orig.attr('id')) {
								$selector.addClass(select_orig.attr('id'));
							}
                            var $dropdown = $('ul', $box).css({'position': 'absolute', 'left': '0', 'z-index': (settings.zIndexStart + 1)});
							var $options = $('li', $box);

                            // update text within $selector if an select-option is pre-selected
                            if(select_orig[0].selectedIndex > 0){
                                $selector.text($('option:selected', select_orig).text());
                            }


							//
                            // hide $drowpdown
							//
                            var hideDropdown = function(){
                               	$dropdown.hide();
                               	$selector.css('outline', '');
                            }


							//
                            // truncate selected option
							//
							var truncate = function(){
	                            if(truncateSelection && !ajustWidths){

	                              	var targetHeight = $box.children(':first').height();
	                              	var targetWidth = $box.children(':first').width();
	                              	var $clone = $box.children(':first').clone().appendTo($box).css({'height':'100%','white-space':'normal','visibility':'hidden'});

									// check height
	                              	var cloneHeight = $clone.height();
	                              	if(cloneHeight > targetHeight){
										$clone.text($clone.text() + '...');
		                              	while(targetHeight < $clone.height()){
											$clone.text($clone.text().replace(/.(\.\.\.)$/, '$1'));
										}
										$box.children(':first').html($clone.text());
	                              	}

									// check width
									$clone.css({'display': 'inline'}).before('<br>');
									var cloneWidth = $clone.width();
									if(cloneWidth > targetWidth){
										$clone.text($clone.text() + '...');
		                              	while(targetWidth <= $clone.width()){
											$clone.text($clone.text().replace(/.(\.\.\.)$/, '$1'));
										}
										$box.children(':first').html($clone.text());
									}

									$clone.prev('br').remove();
									$clone.remove();
	                            }                            
							}

                            // insert replaced selectbox after original selectbox
                            $box.insertAfter(select_orig);
							truncate();


                            //
							// adjust widths: set width of $selector to the same width of $dropdown 
							//
                            if(ajustWidths){
								
								// for a correct calculation of $options.width(), the overflow of $dropdown needs to be set to hidden temporarily in order to remove the scrollbar.
								$dropdown.css('overflow', 'hidden');
								var optionsWidth = $options.width();
								$dropdown.css('overflow', 'auto');

								$selector.width(optionsWidth);
                                if($selector.outerWidth() < $dropdown.outerWidth()){
									$selector.width($selector.width() + ($dropdown.outerWidth() - $selector.outerWidth()));
                                } else {
									$dropdown.width($dropdown.width() + ($selector.outerWidth() - $dropdown.outerWidth()));
								}
                            }

							// width of $dropdown should never be smaller than the width of $selector
							if($dropdown.outerWidth() < $selector.outerWidth()){
								$dropdown.width($selector.outerWidth() - ($dropdown.outerWidth() - $dropdown.width()));
							}


							// initially hide $dropdown
							hideDropdown();


							//
                            // delegate click events
							//
                            $box.click($.delegate({
                                '.selector': function(ev){
                                    ev.stopPropagation();
                                    settings.onDropDown();
                                    if($dropdown.is(':visible')){
                                        $dropdown.hide();
                                        $(document.body).unbind('click', hideDropdown);
                                    } else {
                                        $('.select-replacement ul:visible').each(function(){
                                            $(this).hide();
                                        });
                                        $selector.css('outline', 'none');
                                        settings.animate ? $dropdown.fadeIn('fast') : $dropdown.show();
                                        $(document.body).one('click', hideDropdown);
                                    }
                                },
                                '.option': function(ev){
                                    ev.stopPropagation();
                                    var option = $(ev.target);
                                    if(option.hasClass('disabled')) return;
                                    $options.removeClass('selected');
                                    option.addClass('selected'); 
                                    settings.onSelectOption();
                                    $selector.text(option.text());
									truncate();
                                    select_orig[0].selectedIndex = option.attr('ref');
                                    $dropdown.hide();
                                    $(document.body).unbind('click', hideDropdown);
                                    if(orig_events().change){select_orig.change();}
                                    if(orig_events().click){select_orig.click();}
                                }
                            }));

							//
                            // delegate mouseover and mouseout events
							//
                            $box.mouseover($.delegate({
                                '.selector': function(ev){
                                    if(orig_events().mouseover){select_orig.mouseover();}
                                },
                                '.option': function(ev){
                                    var option = $(ev.target);
                                    option.removeClass('selected');
                                    if(orig_events().mouseover){select_orig.mouseover();}
                                }
                            }));
                            $box.mouseout($.delegate({
                            	'.selector,.option': function(ev){
                            		if(orig_events().mouseout){select_orig.mouseout();}
                            	}
                            }));

                            //
							// focus and blur events
							//
                            $selector.focus(function(ev){
                            	if(orig_events().focus){select_orig.focus();}
                            });
                            $selector.blur(function(ev){
                            	if(orig_events().blur){select_orig.blur();}
                            });

                            //
							// delegate key events
							//
							if(settings.keyAccess){
	                            $box.keydown($.delegate({
	                                '.selector': function(ev){
										var key = ev.keyCode;

										// tab || esc
										if(key == '9' || key == '27'){
											hideDropdown();
										}

										if((key >= '37' && key <= '40') || (key >= '48' && key <= '57') || (key >= '65' && key <= '90')){
											var options  = select_orig[0].options;

											// up or left
											if(key == '37' || key == '38'){
												do {
													select_orig[0].selectedIndex = (select_orig[0].selectedIndex == 0) ? options.length - 1 : select_orig[0].selectedIndex - 1;
												} while(select_orig[0].options[select_orig[0].selectedIndex].disabled)
											}

											// down or right
											if(key == '39' || key == '40'){
												do {
													select_orig[0].selectedIndex = (select_orig[0].selectedIndex < options.length - 1) ? select_orig[0].selectedIndex + 1 : 0;
												} while(select_orig[0].options[select_orig[0].selectedIndex].disabled)
											}

											// letters || numbers
											if((key >= '65' && key <= '90') || (key >= '48' && key <= '57')){
												var letter = "0123456789-------abcdefghijklmnopqrstuvwxyz".substr(key-48,1);
												for(var i = 0; i < options.length; i++) {
													if(options[i].text.substr(0,1).toLowerCase() == letter && !options[i].disabled){
														select_orig[0].selectedIndex = i;
														break;
													} 
												}
											}
											
		                                    $options.removeClass('selected');
											$('li[ref='+select_orig[0].selectedIndex+']', $dropdown).addClass('selected'); 
		                                    settings.onSelectOption();
		                                    $selector.text(options[select_orig[0].selectedIndex].text);
											truncate();
										}
	                                }
	                            }));
							}

                            return $box;
                        }
                    }
                }
            };

            return this.each(function(){

                //
                // find and replace all selectboxes within the fff-context
                //
                $('select', this).each(function(i){
                    var $select_original = $(this);

                    // Do not replace selectboxes marked with a 'fff-exclude'-class.
                    // Do not replace selectboxes which are already replaced.
                    if($select_original.hasClass('fff-exclude') || $select_original.data('is_replaced')) return;

                    // Hide original selectbox. 
                    // This selectbox is fully functional and used for the form submit (progressive enhancement).
                    $select_original.hide();

                    // Build new selectbox.
                    build.selectbox(i).from($select_original);

                    // Attach 'replaced'-flag on original selectbox.
                    $select_original.data('is_replaced', true);
                });
            });
        }   
    });
})(jQuery);


//
// Find all html-elements with a class='fff' keyword in order to replace all selectboxes within. 
// You may use other self defined keywords for a specific implementation. 
//
$(function(){
	$('.fff').fff();
})        
