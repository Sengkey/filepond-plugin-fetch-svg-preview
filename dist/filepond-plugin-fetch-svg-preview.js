/*!
 * FilePondPluginFetchSVGPreview 1.0.8
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 * Please visit undefined for details.
 */

/* eslint-disable */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
    ? define(factory)
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      (global.FilePondPluginFetchSVGPreview = factory()));
})(this, function () {
  'use strict';

  const isPreviewableSVG = (file) =>
    /^.+\.svg/.test(file.name) && !/^image/.test(file.type);

  function removeSVGLinks(svg) {
    var _svg = svg;
    const reOpenATags = /<\s*a[^>]*>(.*?)/g;
    const openATags = svg.match(reOpenATags);

    if (openATags.length > 0) {
      openATags.map((tag) => {
        _svg = _svg.replace(tag, '').replace('</a>', '');
      });
    }

    return _svg;
  }

  const createMediaView = (_) =>
    _.utils.createView({
      name: 'fetch-svg-preview',
      tag: 'div',
      ignoreRect: true,
      create: ({ root, props }) => {
        const { id } = props; // get item

        const item = root.query('GET_ITEM', {
          id: props.id,
        });
        let tagName = 'div';
        root.ref.media = document.createElement(tagName);
        root.element.appendChild(root.ref.media);
      },
      write: _.utils.createRoute({
        DID_MEDIA_PREVIEW_LOAD: ({ root, props }) => {
          const { id } = props; // get item

          const item = root.query('GET_ITEM', {
            id: props.id,
          });
          if (!item) return;
          let URL = window.URL || window.webkitURL;
          let blob = new Blob([item.file], {
            type: item.file.type,
          });
          root.ref.media.type = item.file.type;
          root.ref.media.src =
            (item.file.mock && item.file.url) || URL.createObjectURL(blob); // fetch SVG octet-stream

          if (isPreviewableSVG(item.file)) {
            fetch(root.ref.media.src)
              .then((response) => response.text())
              .then((svg) => {
                root.ref.media.insertAdjacentHTML(
                  'afterbegin',
                  removeSVGLinks(svg)
                ); // Calculate SVG new height

                const viewBox = (/viewBox="([^"]+)"/.exec(svg) || '')[1];
                const viewBoxArray = viewBox.split(' ');
                const svgWidth = +viewBoxArray[2];
                const svgHeight = +viewBoxArray[3];
                const factor = svgWidth / root.ref.media.offsetWidth;
                const height = svgHeight / factor;
                root.dispatch('DID_UPDATE_PANEL_HEIGHT', {
                  id: props.id,
                  height,
                });
              });
          }
        },
      }),
    });

  const createMediaWrapperView = (_) => {
    /**
     * Write handler for when preview container has been created
     */
    const didCreatePreviewContainer = ({ root, props }) => {
      const { id } = props;
      const item = root.query('GET_ITEM', id);
      if (!item) return; // the preview is now ready to be drawn

      root.dispatch('DID_MEDIA_PREVIEW_LOAD', {
        id,
      });
    };
    /**
     * Constructor
     */

    const create = ({ root, props }) => {
      const media = createMediaView(_); // append media presenter

      root.ref.media = root.appendChildView(
        root.createChildView(media, {
          id: props.id,
        })
      );
    };

    return _.utils.createView({
      name: 'fetch-svg-preview-wrapper',
      create,
      write: _.utils.createRoute({
        // fetch-svg preview stated
        DID_MEDIA_PREVIEW_CONTAINER_CREATE: didCreatePreviewContainer,
      }),
    });
  };

  /**
   * Fetch SVG Preview Plugin
   */

  const plugin = (fpAPI) => {
    const { addFilter, utils } = fpAPI;
    const { Type, createRoute } = utils;
    const mediaWrapperView = createMediaWrapperView(fpAPI); // called for each view that is created right after the 'create' method

    addFilter('CREATE_VIEW', (viewAPI) => {
      // get reference to created view
      const { is, view, query } = viewAPI; // only hook up to item view

      if (!is('file')) {
        return;
      } // create the media preview plugin, but only do so if the item is SVG with Octet-Stream content-type

      const didLoadItem = ({ root, props }) => {
        const { id } = props;
        const item = query('GET_ITEM', id);

        if (!item || item.archived || !isPreviewableSVG(item.file)) {
          return;
        } // set preview view

        root.ref.mediaPreview = view.appendChildView(
          view.createChildView(mediaWrapperView, {
            id,
          })
        ); // now ready

        root.dispatch('DID_MEDIA_PREVIEW_CONTAINER_CREATE', {
          id,
        });
      }; // start writing

      view.registerWriter(
        createRoute(
          {
            DID_LOAD_ITEM: didLoadItem,
          },
          ({ root, props }) => {
            const { id } = props;
            const item = query('GET_ITEM', id); // don't do anything while not an SVG octet-stream file or hidden

            if (
              !item ||
              !isPreviewableSVG(item.file) ||
              root.rect.element.hidden
            )
              return;
          }
        )
      );
    }); // expose plugin

    return {
      options: {
        allowFetchSVGPreview: [true, Type.BOOLEAN],
      },
    };
  }; // fire pluginloaded event if running in browser, this allows registering the plugin when using async script tags

  const isBrowser =
    typeof window !== 'undefined' && typeof window.document !== 'undefined';

  if (isBrowser) {
    document.dispatchEvent(
      new CustomEvent('FilePond:pluginloaded', {
        detail: plugin,
      })
    );
  }

  return plugin;
});
