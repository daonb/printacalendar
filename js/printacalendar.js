/**
 * Print-a-Calendar
 *
 * A basic tool for creating and printing calendars.
 *
 *
 * Author:
 *
 * u/krikienoid
 *
 * MIT License 2014
 */

;(function (window, document, $, ZoomPort, undefined) {

    'use strict';

    //
    // Constants
    //

    var MONTHS = [
        { name : 'ינואר',   days : 31 },
        { name : 'פברואר',  days : 28 },
        { name : 'מרץ',     days : 31 },
        { name : 'אפריל',     days : 30 },
        { name : 'מאי',       days : 31 },
        { name : 'יוני',      days : 30 },
        { name : 'יולי',      days : 31 },
        { name : 'אוגוסט',    days : 31 },
        { name : 'ספטמבר', days : 30 },
        { name : 'אוקטובר',   days : 31 },
        { name : 'נובמבר',  days : 30 },
        { name : 'דצמבר',  days : 31 }
    ];

    var WEEKDAYS = [
        'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'
    ];

    //
    // Common
    //

    var CSS_CLASS_NAMES = {
        pageframe         : 'printacal-calendar-pageframe',
        outerframe        : 'printacal-calendar-outerframe',
        innerframe        : 'printacal-calendar-innerframe',
        headerframe       : 'printacal-calendar-headerframe',
        headermonth       : 'printacal-calendar-headermonth',
        headeryear        : 'printacal-calendar-headeryear',
        weekframe         : 'printacal-calendar-weekframe',
        weekdayframe      : 'printacal-calendar-weekdayframe',
        innerweekdayframe : 'printacal-calendar-innerweekdayframe',
        weekday           : 'printacal-calendar-weekday',
        gridframe         : 'printacal-calendar-gridframe',
        dayframe          : 'printacal-calendar-dayframe',
        innerdayframe     : 'printacal-calendar-innerdayframe',
        date              : 'printacal-calendar-date',
        month             : 'printacal-calendar-month',
        year             : 'printacal-calendar-year',
        custom            : 'printacal-calendar-custom'
    };

    var data = {
        year   : null,
        styles : {},
        rules  : {}
    };

    var ui = {},
        styleInputs = {};

    var defaultStyles = {
        pageframe : {
            height   : '297mm',
            width  : '210mm',
            padding : '7mm',
        },
        headerframe : {
            textAlign: 'center',
            padding: '4pt'
        },
        innerframe : {
            width   : '100%',
            height  : '90%'
        },
        weekframe : {
            height       : '0.25in',
            marginBottom : '0.1in'
        },
        gridframe : {
            width        : '100%',
            height       : '6.125in'
        },
        headermonth : {
            fontFamily : 'Alpaca',
            fontWeight : 'bold',
            fontStyle  : 'normal',
            fontSize   : '20pt',
            color      : '#48413A'
        },
        weekdayframe : {
            padding    : '1.5pt'
        },
        innerweekdayframe : {
            padding    : '2pt',
            textAlign  : 'center'
        },
        weekday : {
            color           : '#48413A',
            fontFamily      : 'Alpaca',
            fontWeight      : 'normal',
            fontStyle       : 'normal',
            fontSize        : '12pt'
        },
        dayframe      : {
            padding : '1.5pt'
        },
        innerdayframe : {
            backgroundColor   : 'white',
            borderStyle       : 'dashed',
            borderRightWidth  : '1pt',
            borderLeftWidth   : '1pt',
            borderTopWidth    : '1pt',
            borderBottomWidth : '1pt',
            borderRadius      : '8pt',
            borderColor       : '#040404',
            textAlign         : 'center'
        },
        date : {
            top        : '1mm',
            right      : '1mm',
            fontFamily : 'Georgia',
            fontWeight : 'normal',
            fontStyle  : 'normal',
            fontSize   : '12pt',
            color      : '#48413A'
        },
        month : {
            paddingTop: '12pt',
            fontFamily : 'Alpaca',
            fontStyle  : 'normal',
            fontSize   : '16pt',
            color      : '#48413A',
        },
        year : {
            paddingTop: '2pt',
            fontFamily : 'Alpaca',
            fontStyle  : 'normal',
            fontSize   : '16pt',
            color      : '#48413A',
        }
    };

    //
    // Initialize
    //

    function jumpToMonth (monthIndex) {
        while (monthIndex < 0) {monthIndex += MONTHS.length;}
        monthIndex %= MONTHS.length;
        ui.$monthPages.removeClass('active');
        ui.$monthPage = ui.$monthPages.eq(monthIndex);
        ui.$monthPage.addClass('active');
    }

    function initCustomStyleRules () {

        var customStyleElem, customStyleSheet;

        // Initialize style element
        customStyleElem      = document.createElement('style');
        customStyleElem.id   = 'printacal-custom-stylesheet';
        customStyleElem.type = 'text/css';
        document.head.appendChild(customStyleElem);

        // Get CSSStyleSheet
        for (var i = 0, ii = document.styleSheets.length; i < ii; i++) {
            if (document.styleSheets[i].ownerNode.id === customStyleElem.id) {
                customStyleSheet = document.styleSheets[i];
                break;
            }
        }

        // Initialize CSS rules
        for (var r in CSS_CLASS_NAMES) {if (CSS_CLASS_NAMES.hasOwnProperty(r)) {
            customStyleSheet.insertRule(
                '.' + CSS_CLASS_NAMES[r] + '.' + CSS_CLASS_NAMES.custom + ' {}',
                0
            );
            data.rules[r] = customStyleSheet.cssRules[0];
        }}

    }

    function createInput (inputOpt) {
        var $input;
        switch (inputOpt.valType) {
            case 'borderStyle' :
                $input = $('<select/>')
                    .addClass('printacal-input')
                    .addClass('opts')
                    .append($('<option/>').text('none').attr('selected', 'selected'))
                    .append($('<option/>').text('solid'))
                    .append($('<option/>').text('double'))
                    .append($('<option/>').text('dashed'))
                    .append($('<option/>').text('dotted'))
                    .append($('<option/>').text('groove'))
                    .append($('<option/>').text('inset'))
                    .append($('<option/>').text('outset'));
                break;
            case 'color' :
                $input = $('<input/>')
                    .addClass('printacal-input')
                    .addClass('opts')
                    .attr('type', 'color');
                break;
            case 'fontWeight' :
            case 'fontStyle' :
                $input = $('<input/>')
                    .addClass('printacal-input')
                    .addClass('opts')
                    .attr('type', 'checkbox');
                break;
            case 'length' :
                $input = $('<input/>')
                    .addClass('printacal-input')
                    .addClass('opts')
                    .attr('type', 'text');
                break;
            default :
                $input = $('<input/>')
                    .addClass('printacal-input')
                    .addClass('opts')
                    .attr('type', 'text');
                break;
        }
        switch (inputOpt.cssProp) {
            case 'fontWeight' :
                $input.on('change', function () {
                    setStyleProp(inputOpt.ruleName, inputOpt.cssProp, (this.checked)? 'bold' : 'normal');
                });
                break;
            case 'fontStyle' :
                $input.on('change', function () {
                    setStyleProp(inputOpt.ruleName, inputOpt.cssProp, (this.checked)? 'italic' : 'normal');
                });
                break;
            default :
                $input.on('change', function () {
                    setStyleProp(inputOpt.ruleName, inputOpt.cssProp, this.value);
                });
                break;
        }
        if (!styleInputs[inputOpt.ruleName]) {
            styleInputs[inputOpt.ruleName] = {};
        }
        styleInputs[inputOpt.ruleName][inputOpt.cssProp] = $input;
        return $input;
    }

    function createInputGroup (title, inputOpts) {

        var $inputGroup  = $('<div/>')
                .addClass('printacal-opts-group');

        for (var i = 0, ii = inputOpts.length; i < ii; i++) {
            $inputGroup.append(
                $('<p/>')
                    .text(inputOpts[i].label + ': ')
                    .append(createInput(inputOpts[i]))
            );
        }

        ui.$opts
            .append(
                $('<div/>')
                    .addClass('printacal-opts-section')
                    .append(
                        $('<h2/>')
                        .addClass('printacal-opts-header')
                        .append(
                            $('<a/>')
                            .text(title)
                            .on('click', function () {
                                var $optsSectionFocus = $(this)
                                        .parents('.printacal-opts-section'),
                                    hadFocus = $optsSectionFocus
                                        .hasClass('focus');
                                $('.printacal-opts-section')
                                    .removeClass('focus');
                                if (!hadFocus) {
                                    $optsSectionFocus.addClass('focus');
                                }
                            })
                        )
                    )
                    .append($inputGroup)
            );

    }

    function initInputFields () {

        createInputGroup('Page Size', [
            {ruleName : 'pageframe', cssProp : 'width',   label : 'Page Width',   valType : 'length'},
            {ruleName : 'pageframe', cssProp : 'height',  label : 'Page Height',  valType : 'length'},
            {ruleName : 'pageframe', cssProp : 'padding', label : 'Page Margins', valType : 'length'}
        ]);
        createInputGroup('Grid', [
            {ruleName : 'gridframe', cssProp : 'width',           label : 'Grid Width',       valType : 'length'},
            {ruleName : 'gridframe', cssProp : 'height',          label : 'Grid Height',      valType : 'length'},
            {ruleName : 'gridframe', cssProp : 'backgroundColor', label : 'Background Color', valType : 'color' },
            {ruleName : 'dayframe',  cssProp : 'padding',         label : 'Gutter',           valType : 'length'}
        ]);
        createInputGroup('Cell', [
            {ruleName : 'innerdayframe', cssProp : 'backgroundColor',   label : 'Background Color', valType : 'color'},
            {ruleName : 'innerdayframe', cssProp : 'borderTopWidth',    label : 'Border Top',       valType : 'length'},
            {ruleName : 'innerdayframe', cssProp : 'borderLeftWidth',   label : 'Border Left',      valType : 'length'},
            {ruleName : 'innerdayframe', cssProp : 'borderRightWidth',  label : 'Border Right',     valType : 'length'},
            {ruleName : 'innerdayframe', cssProp : 'borderBottomWidth', label : 'Border Bottom',    valType : 'length'},
            {ruleName : 'innerdayframe', cssProp : 'borderStyle',       label : 'Border Style',     valType : 'borderStyle'},
            {ruleName : 'innerdayframe', cssProp : 'borderColor',       label : 'Border Color',     valType : 'color'}
        ]);
        createInputGroup('Cell Date', [
            {ruleName : 'date', cssProp : 'left',            label : 'Position X',       valType : 'length'},
            {ruleName : 'date', cssProp : 'top',             label : 'Position Y',       valType : 'length'},
            {ruleName : 'date', cssProp : 'backgroundColor', label : 'Background Color', valType : 'color'},
            {ruleName : 'date', cssProp : 'color',           label : 'Font Color',       valType : 'color'},
            {ruleName : 'date', cssProp : 'fontFamily',      label : 'Font',             valType : 'length'},
            {ruleName : 'date', cssProp : 'fontWeight',      label : 'Bold',             valType : 'fontWeight'},
            {ruleName : 'date', cssProp : 'fontStyle',       label : 'Italic',           valType : 'fontStyle'},
            {ruleName : 'date', cssProp : 'fontSize',        label : 'Font Size',        valType : 'length'}
        ]);
        createInputGroup('Header Month', [
            {ruleName : 'headermonth', cssProp : 'left',       label : 'Position X', valType : 'length'},
            {ruleName : 'headermonth', cssProp : 'top',        label : 'Position Y', valType : 'length'},
            {ruleName : 'headermonth', cssProp : 'color',      label : 'Font Color', valType : 'color'},
            {ruleName : 'headermonth', cssProp : 'fontFamily', label : 'Font',       valType : 'length'},
            {ruleName : 'headermonth', cssProp : 'fontWeight', label : 'Bold',       valType : 'fontWeight'},
            {ruleName : 'headermonth', cssProp : 'fontStyle',  label : 'Italic',     valType : 'fontStyle'},
            {ruleName : 'headermonth', cssProp : 'fontSize',   label : 'Font Size',  valType : 'length'}
        ]);
        createInputGroup('Header Year', [
            {ruleName : 'headeryear', cssProp : 'left',       label : 'Position X', valType : 'length'},
            {ruleName : 'headeryear', cssProp : 'top',        label : 'Position Y', valType : 'length'},
            {ruleName : 'headeryear', cssProp : 'color',      label : 'Font Color', valType : 'color'},
            {ruleName : 'headeryear', cssProp : 'fontFamily', label : 'Font',       valType : 'length'},
            {ruleName : 'headeryear', cssProp : 'fontWeight', label : 'Bold',       valType : 'fontWeight'},
            {ruleName : 'headeryear', cssProp : 'fontStyle',  label : 'Italic',     valType : 'fontStyle'},
            {ruleName : 'headeryear', cssProp : 'fontSize',   label : 'Font Size',  valType : 'length'}
        ]);
        createInputGroup('Week Day Frame', [
            {ruleName : 'weekdayframe',      cssProp : 'padding',         label : 'Gutter',           valType : 'length'},
            {ruleName : 'innerweekdayframe', cssProp : 'padding',         label : 'Padding',          valType : 'length'},
            {ruleName : 'innerweekdayframe', cssProp : 'backgroundColor', label : 'Background Color', valType : 'color'}
        ]);
        createInputGroup('Week Days', [
            {ruleName : 'weekday', cssProp : 'color',           label : 'Font Color',       valType : 'color'},
            {ruleName : 'weekday', cssProp : 'fontFamily',      label : 'Font',             valType : 'length'},
            {ruleName : 'weekday', cssProp : 'fontWeight',      label : 'Bold',             valType : 'fontWeight'},
            {ruleName : 'weekday', cssProp : 'fontStyle',       label : 'Italic',           valType : 'fontStyle'},
            {ruleName : 'weekday', cssProp : 'fontSize',        label : 'Font Size',        valType : 'length'}
        ]);

    }

    function initZoomControls () {

        function updateZoomLevel () {
            ui.$zoomInput.val((ui.zoomPort.scale() * 100) + '%');
        }

        ui.zoomPort = ZoomPort(document.getElementById('printacal-zoomport'));
        ui.$zoomInput = $('#printacal-zoom-input');

        $('#printacal-zoom-plus').on('click', function () {
            ui.zoomPort.scale(ui.zoomPort.scale() * 2);
            updateZoomLevel();
        });
        $('#printacal-zoom-minus').on('click', function () {
            ui.zoomPort.scale(ui.zoomPort.scale() / 2);
            updateZoomLevel();
        });
        $('#printacal-zoom-reset').on('click', function () {
            ui.zoomPort.scale(1);
            updateZoomLevel();
        });
        $('#printacal-zoom-input').on('change', function () {
            ui.zoomPort.scale(window.parseFloat(this.value) / 100);
            updateZoomLevel();
        });
        $('#printacal-zoom-fit').on('click', function () {
            ui.zoomPort.to({element : ui.$monthPage[0]});
            updateZoomLevel();
        });

        ui.zoomPort.scale(0.5);
        updateZoomLevel();

    }

    function initMonthControls () {

        var monthIndex = 0,
            KEY_PREV   = 219,
            KEY_NEXT   = 221;

        function updateMonth () {
            if (monthIndex < 0) {monthIndex += MONTHS.length;}
            if (monthIndex >= MONTHS.length) {monthIndex -= MONTHS.length;}
            ui.$currentMonth.text(MONTHS[monthIndex].name);
        }

        function prevMonth () {
            jumpToMonth(--monthIndex);
            updateMonth();
        }

        function nextMonth () {
            jumpToMonth(++monthIndex);
            updateMonth();
        }

        ui.$currentMonth = $('#printacal-month-current');

        $('#printacal-month-prev').on('click', prevMonth);
        $('#printacal-month-next').on('click', nextMonth);
        $(document).on('keydown', function (e) {
            if (e.which === KEY_PREV || e.keycode === KEY_PREV) { // Left
                prevMonth();
            }
            else if (e.which === KEY_NEXT || e.keycode === KEY_NEXT) { // Right
                nextMonth();
            }
        });

        updateMonth();

    }

    function initUI () {

        // HTML Elements
        ui.$view = $('#printacal-page-view');
        ui.$year = $('#printacal-year');
        ui.$opts = $('#printacal-options');

        ui.$year.on('change', function () {
            
            setCalendar(ui.$year.val());
        });

        $('#printacal-print').on('click', window.print.bind(window));
        $('#printacal-show-opts').on('click', function () {
            $(this).parents('.wrapper-head').toggleClass('open');
        });

        // Custom CSS Input Fields
        initInputFields();

        // NOTE: spectrum.js only works on element already appended to the DOM
        // Delay spectrum init until after all inputs have been appended to the DOM
        $('input[type="color"]').each(function (i, input) {
            var $input = $(input);
            $input.spectrum({
                change : function () {$input.val($input.spectrum('get').toHexString());},
                allowEmpty : true,
                showInput  : true
            });
        });

        // Init Controls
        initZoomControls();
        initMonthControls();

    }

    function init () {
        initCustomStyleRules();
        initUI();
        setCalendar((new window.Date()).getYear() + 1901);
        setStyles(defaultStyles);

        init = null;
    }

    //
    // Set Calendar
    //

    function createDayBlock (day, monthIndex) {
        var db = $('<div/>')
                       .addClass(CSS_CLASS_NAMES.dayframe)
                       .addClass(CSS_CLASS_NAMES.custom),
            innerDay = $('<div/>')
                       .addClass(CSS_CLASS_NAMES.innerdayframe)
                       .addClass(CSS_CLASS_NAMES.custom),
            date = $('<div/>')
                   .addClass(CSS_CLASS_NAMES.date)
                   .addClass(CSS_CLASS_NAMES.custom)
                   .text(day),
            year = new Date().getFullYear();
                       
        
        if (day == 1) {
            innerDay.append(
                    $('<div/>')
                        .addClass(CSS_CLASS_NAMES.month)
                        .addClass(CSS_CLASS_NAMES.custom)
                        .text(MONTHS[monthIndex % 12].name),
                    $('<div style="clear:both;"/>')
                        .addClass(CSS_CLASS_NAMES.year)
                        .addClass(CSS_CLASS_NAMES.custom)
                        .text(String(year))
            );
        }
        else if (day == 18) {
            date.css('fontWeight', 'bold');
            date.css('fontSize', '14pt');
            innerDay.append(
                    $('<div/>')
                        .addClass(CSS_CLASS_NAMES.month)
                        .addClass(CSS_CLASS_NAMES.custom)
                        .text(MONTHS[monthIndex % 12].name),
                    $('<div style="clear:both;"/>')
                        .addClass(CSS_CLASS_NAMES.year)
                        .addClass(CSS_CLASS_NAMES.custom)
                        .text((monthIndex==11)?String(year):String(year+1))
            );
        }
        innerDay.append(date);
        db.append(innerDay);
        return db;
    }

    function createBlankBlock () {
        return (
            $('<div/>')
                .addClass(CSS_CLASS_NAMES.dayframe)
                .addClass('blank')
        );
    }

    function createWeekFrame () {
        var $newWeekFrame = $('<div/>')
                .addClass(CSS_CLASS_NAMES.weekframe)
                .addClass(CSS_CLASS_NAMES.custom);
        for (var i = 0, ii = WEEKDAYS.length; i < ii; i++) {
            $newWeekFrame.append(
                $('<div/>')
                    .addClass(CSS_CLASS_NAMES.weekdayframe)
                    .addClass(CSS_CLASS_NAMES.custom)
                    .append(
                        $('<div/>')
                            .addClass(CSS_CLASS_NAMES.innerweekdayframe)
                            .addClass(CSS_CLASS_NAMES.custom)
                            .append(
                                $('<div/>')
                                    .addClass(CSS_CLASS_NAMES.weekday)
                                    .addClass(CSS_CLASS_NAMES.custom)
                                    .text(WEEKDAYS[i])
                            )
                    )
            );
        }
        return $newWeekFrame;
    }

    function createGridFrame (year, monthIndex) {
        var startOfMonth  = (getDayOfWeek(year, monthIndex + 1, 18) + 6) % 7,
            days          = getDaysInAMonth(year, monthIndex + 1),
            $newGridFrame = $('<div/>')
                .addClass(CSS_CLASS_NAMES.gridframe)
                .addClass(CSS_CLASS_NAMES.custom),
            i;
        for (i = 0; i < startOfMonth; i++) {
            $newGridFrame.append(createBlankBlock());
        }
        for (i = 18; i < days+18; i++) {
            var mi = monthIndex,
                day = i;

            if (day > days) {
                mi ++;
                day -= days;
            }
            $newGridFrame.append(createDayBlock(day, mi));
        }
        for (i = startOfMonth + days; i < 35; i++) {
            $newGridFrame.append(createBlankBlock());
        }
        return $newGridFrame;
    }

    function createMonthPage (year, monthIndex) {
        var h = ['וחודש', 'וחודשיים', 'ושלושה חודשים', 'וארבעה חודשים', 'וחמישה חודשים',
                 'ושישה חודשים', 'ושבעה חודשים', 'ושמונה חודשים', 'ותשעה חודשים',
                 'ועשרה חודשים', 'ואחת עשרה חודשים', '卄卂卩卩ㄚ  乃丨尺ㄒ卄ᗪ卂ㄚ  ᗪ卂几丨乇ㄥㄥ卂'];
        return (
            $('<div/>')
                .addClass(CSS_CLASS_NAMES.pageframe)
                .addClass(CSS_CLASS_NAMES.custom)
                .addClass('printacal-dropshadow')
                .append(
                    $('<div/>')
                        .addClass(CSS_CLASS_NAMES.outerframe)
                        .addClass(CSS_CLASS_NAMES.custom)
                        .append($('<div style="width: 100%;" \>')
                            .append($('<img/>')
                                    .attr('alt', "Yet Another View of Month Fuji")
                                    .attr('src', "/img/cover."+((monthIndex+1)%12+1).toString()+".JPG")
                                    .attr('width', "100%")
                            )
                        )
                        .append($('<div/>')
                                .addClass(CSS_CLASS_NAMES.headerframe)
                                .addClass(CSS_CLASS_NAMES.custom)
                                // .addClass("triangle-isosceles")
                                .append($('<span/>')
                                        .addClass(CSS_CLASS_NAMES.headermonth)
                                        .addClass(CSS_CLASS_NAMES.custom)
                                        .text(((monthIndex!=11)?'דניאלה בת אחת עשרה ':'')+h[monthIndex])
                                )
                        )
                        .append($('<div/>')
                                .addClass(CSS_CLASS_NAMES.innerframe)
                                .addClass(CSS_CLASS_NAMES.custom)
                                .append(createWeekFrame())
                                .append(createGridFrame(year, monthIndex))
                        )
                )
        );
    }

    function setCalendar (year) {
        ui.$view.empty();
        for (var i = 0; i < MONTHS.length; i++) {
            ui.$view.append(createMonthPage((i==0)?year-1:year,
                                            (i+11) % 12));
        }
        ui.$monthPages = ui.$view.children('.' + CSS_CLASS_NAMES.pageframe);
        jumpToMonth(0);
    }

    //
    // Set Styles
    //

    function setStyleProp (ruleName, cssProp, cssVal) {

        var $input;
        cssVal = cssVal.toLowerCase();

        // Update corresponding input elements
        if (styleInputs[ruleName]) {
            $input = styleInputs[ruleName][cssProp];
        }
        if ($input) {
            $input.val(cssVal);
            if (cssProp === 'fontWeight') {
                $input.attr('checked', !!(cssVal === 'bold'));
            }
            else if (cssProp === 'fontStyle')  {
                $input.attr('checked', !!(cssVal === 'italic'));
            }
            else if ($input.attr('type') === 'color') {
                $input.spectrum('set', cssVal);
            }
        }

        // Set and store CSS property value
        if (!data.styles[ruleName]) {
            data.styles[ruleName] = {};
        }
        data.styles[ruleName][cssProp] = data.rules[ruleName].style[cssProp] = cssVal;

        // return value
        return data.rules[ruleName].cssText;

    };

    function setStyles (styleOpts) {
        for (var r in styleOpts) {if (styleOpts.hasOwnProperty(r)) {
            for (var p in styleOpts[r]) {if (styleOpts[r].hasOwnProperty(p)) {
                setStyleProp(r, p, styleOpts[r][p]);
            }}
        }}
    }

    //
    // Calendar Utilities
    //

    function isLeapYear (year) {
             if (year % 4   !== 0) return false;
        else if (year % 100 !== 0) return true;
        else if (year % 400 !== 0) return false;
        else                       return true;
    }

    function getDaysInAMonth (year, month) {
        if (month === 2 && isLeapYear(year)) {
            return MONTHS[month - 1].days + 1;
        }
        else {
            return MONTHS[month - 1].days;
        }
    }

    function getDayOfWeek (year, month, day) {
        // SOURCE: http://mathforum.org/library/drmath/view/55837.html
        if (month === 1 || month === 2) {
            year  -= 1;
            month += 12;
        }
        return (
            (
                day +
                2 * month +
                window.Math.floor((3 * (month + 1)) / 5) +
                year +
                window.Math.floor(year / 4) -
                window.Math.floor(year / 100) +
                window.Math.floor(year / 400) +
                2
            ) % 7
        );
    }

    //
    // Init
    //

    $(document).ready(ZoomPort.init);
    $(document).ready(init);

    //
    // Export
    //

    window.printacal = {
        setStyleProp : setStyleProp,
        exportStyles : function () {return window.JSON.stringify(data.styles);},
        importStyles : function (styleOpts) {
            if (typeof styleOpts === 'string') {styleOpts = window.JSON.parse(styleOpts);}
            setStyles(styleOpts);
        }
    };

})(window, document, jQuery, ZoomPort);
