angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function($document, $window) {
    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * Computes the `left` position property of a target element to be
     * positioned.
     * @param place the placement of the target element relative to the
     *    host. For instance, place `'bottom'` means the target element
     *    will be placed below the host.
     * @param align the alignment of the element relative to the host.
     *    For instance, align `'left'` means align the element with the host's
     *    left edge. `'center'` may be passed to center the element.
     * @param hostElPos the host element position, having at least a `width`
     *    and `left` property.
     * @param targetElWidth the width of the target element as a number of
     *    pixels.
     */
    function computeLeftProperty(place, align, hostElPos, targetElWidth) {
      if (place === 'left') {
        return hostElPos.left - targetElWidth;
      }

      if (place === 'top' || place === 'bottom') {
        if (align === 'left') {
          return hostElPos.left;
        }
        if (align === 'center') {
          return (hostElPos.left + hostElPos.width / 2) - (targetElWidth / 2);
        }
        // align === 'right'
        return (hostElPos.left + hostElPos.width) - targetElWidth;
      }

      // place === 'right'
      return hostElPos.left + hostElPos.width;
    }

    /**
     * Computes the `top` position property of a target element to be
     * positioned.
     * @param place the placement of the target element relative to the
     *    host. For instance, place `'bottom'` means the target element
     *    will be placed below the host.
     * @param align the alignment of the element relative to the host.
     *    For instance, align `'left'` means align the element with the host's
     *    left edge. `'center'` may be passed to center the element.
     * @param hostElPos the host element position, having at least a `height`
     *    and `top` property.
     * @param targetElHeight the height of the target element as a number of
     *    pixels.
     */
    function computeTopProperty(place, align, hostElPos, targetElHeight) {
      if (place === 'top') {
        return hostElPos.top - targetElHeight;
      }

      if (place === 'right' || place === 'left') {
        if (align === 'top') {
          return hostElPos.top;
        }
        if (align === 'center') {
          return (hostElPos.top + hostElPos.height / 2) - (targetElHeight / 2);
        }
        // align === 'bottom'
        return (hostElPos.top + hostElPos.height) - targetElHeight;
      }

      // place === 'bottom'
      return hostElPos.top + hostElPos.height;
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function(element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function(element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function(element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
      positionElements: function(hostEl, targetEl, positionStr, appendToBody) {
        var positionStrParts = positionStr.split('-');
        var place = positionStrParts[0],
          align = positionStrParts[1] || 'center',
          targetElPos = {};

        var hostElPos,
          targetElWidth,
          targetElHeight;

        if (place !== 'top' && place !== 'right' && place !== 'bottom' && place !== 'left') {
          place = 'top';
        }
        if (align !== 'top' && align !== 'right' && align !== 'bottom' && align !== 'left' && align !== 'center') {
          align = 'center';
        }

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        return {
          top: computeTopProperty(place, align, hostElPos, targetElHeight),
          left: computeLeftProperty(place, align, hostElPos, targetElWidth)
        };
      }
    };
  }]);
