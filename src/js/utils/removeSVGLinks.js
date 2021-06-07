export function removeSVGLinks(svg) {
    var _svg = svg;
    const reOpenATags = /<\s*a[^>]*>(.*?)/g;
    const openATags = svg.match(reOpenATags);
    if(openATags.length > 0) {
        openATags.map( tag => {
            _svg = _svg.replace(tag,"").replace("</a>","")
        });
    }
    return _svg;
}