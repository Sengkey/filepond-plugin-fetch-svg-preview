import { createMediaWrapperView } from './view/createMediaWrapperView';
import { isPreviewableSVG } from './utils/isPreviewableSVG';

/**
 * Fetch SVG Preview Plugin
 */
const plugin = fpAPI => {

    const { addFilter, utils } = fpAPI;
    const { Type, createRoute } = utils;
    const mediaWrapperView = createMediaWrapperView(fpAPI);

    // called for each view that is created right after the 'create' method
    addFilter('CREATE_VIEW', viewAPI => {
        
        // get reference to created view
        const { is, view, query } = viewAPI;

        // only hook up to item view
        if (!is('file')) {
            return;
        }

        // create the media preview plugin, but only do so if the item is SVG with Octet-Stream content-type
        const didLoadItem = ({ root, props }) => {
            const { id } = props;
            const item = query('GET_ITEM', id);

            if (!item || item.archived || (!isPreviewableSVG(item.file))) {
                return;
            }

            // set preview view
            root.ref.mediaPreview = view.appendChildView(
                view.createChildView(mediaWrapperView, { id })
            );

            // now ready
            root.dispatch('DID_MEDIA_PREVIEW_CONTAINER_CREATE', { id });
        };

        // start writing
        view.registerWriter(
            createRoute({
                DID_LOAD_ITEM: didLoadItem
            }, ({ root, props }) => {
                const { id } = props;
                const item = query('GET_ITEM', id);

                // don't do anything while not an SVG octet-stream file or hidden
                if ((!isPreviewableSVG(item.file)) || root.rect.element.hidden) return;
            })
        );
    });

    // expose plugin
    return {
        options: {
            allowFetchSVGPreview: [true, Type.BOOLEAN]
        }
    };
};

// fire pluginloaded event if running in browser, this allows registering the plugin when using async script tags
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
if (isBrowser) {
    document.dispatchEvent(new CustomEvent('FilePond:pluginloaded', { detail: plugin }));
}

export default plugin;