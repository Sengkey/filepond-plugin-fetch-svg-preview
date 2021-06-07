import { isPreviewableSVG } from './../utils/isPreviewableSVG';
import { removeSVGLinks } from './../utils/removeSVGLinks';
 
export const createMediaView = _ =>
    _.utils.createView({
        name: 'fetch-svg-preview',
        tag: 'div',
        ignoreRect: true,
        create: ({ root, props }) => {
            const { id } = props;

            // get item
            const item = root.query('GET_ITEM', { id: props.id });
            let tagName = 'div';

            root.ref.media = document.createElement(tagName);
            root.element.appendChild(root.ref.media);

        },
        write: _.utils.createRoute({
            DID_MEDIA_PREVIEW_LOAD: ({ root, props }) => {
                const { id } = props;

                // get item
                const item = root.query('GET_ITEM', { id: props.id });
                if (!item) return;

                let URL = window.URL || window.webkitURL;
                let blob = new Blob([item.file], { type: item.file.type });

                root.ref.media.type = item.file.type;
                root.ref.media.src = item.file.mock && item.file.url || URL.createObjectURL(blob);
                
                // fetch SVG octet-stream
                if (isPreviewableSVG(item.file)) {

                    fetch(root.ref.media.src)
                        .then(response => response.text())
                        .then(svg => {
                            
                            root.ref.media.insertAdjacentHTML("afterbegin", removeSVGLinks(svg));

                            // Calculate SVG new height
                            const viewBox = (/viewBox="([^"]+)"/.exec(svg) || '')[1];
                            const viewBoxArray = viewBox.split(" ");
                            const svgWidth = +viewBoxArray[2];
                            const svgHeight = +viewBoxArray[3];

                            const factor = svgWidth / root.ref.media.offsetWidth;
                            const height = svgHeight / factor;

                            root.dispatch('DID_UPDATE_PANEL_HEIGHT', {
                                id: props.id,
                                height
                            });
                        });


                }
            }
        })
    });
