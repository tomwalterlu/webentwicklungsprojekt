(function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" == typeof require && require;if (!f && c) return c(i, !0);if (u) return u(i, !0);var a = new Error("Cannot find module '" + i + "'");throw a.code = "MODULE_NOT_FOUND", a;
                }var p = n[i] = { exports: {} };e[i][0].call(p.exports, function (r) {
                    var n = e[i][1][r];return o(n || r);
                }, p, p.exports, r, e, n, t);
            }return n[i].exports;
        }for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);return o;
    }return r;
})()({ 1: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        function applyStyleWithOptions(clonedNode, options) {
            var style = clonedNode.style;
            if (options.backgroundColor) {
                style.backgroundColor = options.backgroundColor;
            }
            if (options.width) {
                style.width = options.width + "px";
            }
            if (options.height) {
                style.height = options.height + "px";
            }
            if (options.style) {
                Object.assign(style, options.style);
            }
            return clonedNode;
        }
        exports.default = applyStyleWithOptions;
    }, {}], 2: [function (require, module, exports) {
        "use strict";

        var __importDefault = this && this.__importDefault || function (mod) {
            return mod && mod.__esModule ? mod : { "default": mod };
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        var utils_1 = require("./utils");
        var clonePseudoElements_1 = __importDefault(require("./clonePseudoElements"));
        function cloneSingleNode(nativeNode) {
            if (nativeNode instanceof HTMLCanvasElement) {
                return utils_1.createImage(nativeNode.toDataURL());
            }
            if (nativeNode.tagName && nativeNode.tagName.toLowerCase() === 'svg') {
                return Promise.resolve(nativeNode).then(function (svg) {
                    return utils_1.svgToDataURL(svg);
                }).then(utils_1.createImage);
            }
            return Promise.resolve(nativeNode.cloneNode(false));
        }
        function cloneChildren(nativeNode, clonedNode, filter) {
            var children = utils_1.toArray(nativeNode.childNodes);
            if (children.length === 0) {
                return Promise.resolve(clonedNode);
            }
            // clone children in order
            return children.reduce(function (done, child) {
                return done.then(function () {
                    return cloneNode(child, filter);
                }).then(function (clonedChild) {
                    if (clonedChild) {
                        clonedNode.appendChild(clonedChild);
                    }
                });
            }, Promise.resolve()).then(function () {
                return clonedNode;
            });
        }
        function cloneCssStyle(nativeNode, clonedNode) {
            var source = window.getComputedStyle(nativeNode);
            var target = clonedNode.style;
            if (source.cssText) {
                target.cssText = source.cssText;
            } else {
                utils_1.toArray(source).forEach(function (name) {
                    target.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
                });
            }
        }
        function cloneInputValue(nativeNode, clonedNode) {
            if (nativeNode instanceof HTMLTextAreaElement) {
                clonedNode.innerHTML = nativeNode.value;
            }
            if (nativeNode instanceof HTMLInputElement) {
                clonedNode.setAttribute('value', nativeNode.value);
            }
        }
        function decorate(nativeNode, clonedNode) {
            if (!(clonedNode instanceof Element)) {
                return clonedNode;
            }
            return Promise.resolve().then(function () {
                return cloneCssStyle(nativeNode, clonedNode);
            }).then(function () {
                return clonePseudoElements_1.default(nativeNode, clonedNode);
            }).then(function () {
                return cloneInputValue(nativeNode, clonedNode);
            }).then(function () {
                return clonedNode;
            });
        }
        function cloneNode(domNode, filter, isRoot) {
            if (!isRoot && filter && !filter(domNode)) {
                return Promise.resolve(null);
            }
            return Promise.resolve(domNode).then(cloneSingleNode).then(function (clonedNode) {
                return cloneChildren(domNode, clonedNode, filter);
            }).then(function (clonedNode) {
                return decorate(domNode, clonedNode);
            });
        }
        exports.default = cloneNode;
    }, { "./clonePseudoElements": 3, "./utils": 10 }], 3: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var utils_1 = require("./utils");
        function formatCssText(style) {
            var content = style.getPropertyValue('content');
            return style.cssText + " content: " + content + ";";
        }
        function formatCssProperties(style) {
            return utils_1.toArray(style).map(function (name) {
                var value = style.getPropertyValue(name);
                var priority = style.getPropertyPriority(name);
                return name + ": " + value + (priority ? ' !important' : '') + ";";
            }).join(' ');
        }
        function getPseudoElementStyle(className, pseudo, style) {
            var selector = "." + className + ":" + pseudo;
            var cssText = style.cssText ? formatCssText(style) : formatCssProperties(style);
            return document.createTextNode(selector + "{" + cssText + "}");
        }
        function clonePseudoElement(nativeNode, clonedNode, pseudo) {
            var style = window.getComputedStyle(nativeNode, pseudo);
            var content = style.getPropertyValue('content');
            if (content === '' || content === 'none') {
                return;
            }
            var className = utils_1.uuid();
            var styleElement = document.createElement('style');
            styleElement.appendChild(getPseudoElementStyle(className, pseudo, style));
            clonedNode.className = clonedNode.className + " " + className;
            clonedNode.appendChild(styleElement);
        }
        function clonePseudoElements(nativeNode, clonedNode) {
            [':before', ':after'].forEach(function (pseudo) {
                return clonePseudoElement(nativeNode, clonedNode, pseudo);
            });
        }
        exports.default = clonePseudoElements;
    }, { "./utils": 10 }], 4: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var utils_1 = require("./utils");
        function createSvgDataURL(clonedNode, width, height) {
            var xmlns = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(xmlns, 'svg');
            var foreignObject = document.createElementNS(xmlns, 'foreignObject');
            svg.setAttributeNS('', 'width', "" + width);
            svg.setAttributeNS('', 'height', "" + height);
            foreignObject.setAttributeNS('', 'width', '100%');
            foreignObject.setAttributeNS('', 'height', '100%');
            foreignObject.setAttributeNS('', 'x', '0');
            foreignObject.setAttributeNS('', 'y', '0');
            foreignObject.setAttributeNS('', 'externalResourcesRequired', 'true');
            svg.appendChild(foreignObject);
            foreignObject.appendChild(clonedNode);
            return utils_1.svgToDataURL(svg);
        }
        exports.default = createSvgDataURL;
    }, { "./utils": 10 }], 5: [function (require, module, exports) {
        "use strict";

        var __importDefault = this && this.__importDefault || function (mod) {
            return mod && mod.__esModule ? mod : { "default": mod };
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        var utils_1 = require("./utils");
        var getBlobFromURL_1 = __importDefault(require("./getBlobFromURL"));
        var embedResources_1 = __importDefault(require("./embedResources"));
        function embedBackground(clonedNode, options) {
            var background = clonedNode.style.getPropertyValue('background');
            if (!background) {
                return Promise.resolve(clonedNode);
            }
            return Promise.resolve(background).then(function (cssString) {
                return embedResources_1.default(cssString, null, options);
            }).then(function (cssString) {
                clonedNode.style.setProperty('background', cssString, clonedNode.style.getPropertyPriority('background'));
                return clonedNode;
            });
        }
        function embedImageNode(clonedNode, options) {
            if (!(clonedNode instanceof HTMLImageElement) || utils_1.isDataUrl(clonedNode.src)) {
                return Promise.resolve(clonedNode);
            }
            return Promise.resolve(clonedNode.src).then(function (url) {
                return getBlobFromURL_1.default(url, options);
            }).then(function (data) {
                return utils_1.toDataURL(data, utils_1.getMimeType(clonedNode.src));
            }).then(function (dataURL) {
                return new Promise(function (resolve, reject) {
                    clonedNode.onload = resolve;
                    clonedNode.onerror = reject;
                    clonedNode.src = dataURL;
                });
            }).then(function () {
                return clonedNode;
            }, function () {
                return clonedNode;
            });
        }
        function embedChildren(clonedNode, options) {
            var children = utils_1.toArray(clonedNode.childNodes);
            var deferreds = children.map(function (child) {
                return embedImages(child, options);
            });
            return Promise.all(deferreds).then(function () {
                return clonedNode;
            });
        }
        function embedImages(clonedNode, options) {
            if (!(clonedNode instanceof Element)) {
                return Promise.resolve(clonedNode);
            }
            return Promise.resolve(clonedNode).then(function (node) {
                return embedBackground(node, options);
            }).then(function (node) {
                return embedImageNode(node, options);
            }).then(function (node) {
                return embedChildren(node, options);
            });
        }
        exports.default = embedImages;
    }, { "./embedResources": 6, "./getBlobFromURL": 8, "./utils": 10 }], 6: [function (require, module, exports) {
        "use strict";

        var __importDefault = this && this.__importDefault || function (mod) {
            return mod && mod.__esModule ? mod : { "default": mod };
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        var getBlobFromURL_1 = __importDefault(require("./getBlobFromURL"));
        var utils_1 = require("./utils");
        var URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
        function resolveUrl(url, baseUrl) {
            // url is absolute already
            if (url.match(/^[a-z]+:\/\//i)) {
                return url;
            }
            // url is absolute already, without protocol
            if (url.match(/^\/\//)) {
                return window.location.protocol + url;
            }
            // dataURI, mailto:, tel:, etc.
            if (url.match(/^[a-z]+:/i)) {
                return url;
            }
            var doc = document.implementation.createHTMLDocument();
            var base = doc.createElement('base');
            var a = doc.createElement('a');
            doc.head.appendChild(base);
            doc.body.appendChild(a);
            if (baseUrl) {
                base.href = baseUrl;
            }
            a.href = url;
            return a.href;
        }
        function escape(url) {
            return url.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
        }
        function urlToRegex(url) {
            return new RegExp("(url\\(['\"]?)(" + escape(url) + ")(['\"]?\\))", 'g');
        }
        function parseURLs(str) {
            var result = [];
            str.replace(URL_REGEX, function (raw, quotation, url) {
                result.push(url);
                return raw;
            });
            return result.filter(function (url) {
                return !utils_1.isDataUrl(url);
            });
        }
        function embed(cssString, resourceURL, baseURL, options) {
            var resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;
            return Promise.resolve(resolvedURL).then(function (url) {
                return getBlobFromURL_1.default(url, options);
            }).then(function (data) {
                return utils_1.toDataURL(data, utils_1.getMimeType(resourceURL));
            }).then(function (dataURL) {
                return cssString.replace(urlToRegex(resourceURL), "$1" + dataURL + "$3");
            }).then(function (content) {
                return content;
            }, function () {
                return resolvedURL;
            });
        }
        function shouldEmbed(string) {
            return string.search(URL_REGEX) !== -1;
        }
        exports.shouldEmbed = shouldEmbed;
        function embedResources(cssString, baseUrl, options) {
            if (!shouldEmbed(cssString)) {
                return Promise.resolve(cssString);
            }
            return Promise.resolve(cssString).then(parseURLs).then(function (urls) {
                return urls.reduce(function (done, url) {
                    return done.then(function (ret) {
                        return embed(ret, url, baseUrl, options);
                    });
                }, Promise.resolve(cssString));
            });
        }
        exports.default = embedResources;
    }, { "./getBlobFromURL": 8, "./utils": 10 }], 7: [function (require, module, exports) {
        "use strict";

        var __importStar = this && this.__importStar || function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
            result["default"] = mod;
            return result;
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        var utils_1 = require("./utils");
        var embedResources_1 = __importStar(require("./embedResources"));
        function parseCSS(source) {
            if (source === undefined) {
                return [];
            }
            var cssText = source;
            var css = [];
            var cssKeyframeRegex = '((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})';
            var combinedCSSRegex = '((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]' + '*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})'; // to match css & media queries together
            var cssCommentsRegex = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/)', 'gi');
            // strip out comments
            cssText = cssText.replace(cssCommentsRegex, '');
            var keyframesRegex = new RegExp(cssKeyframeRegex, 'gi');
            var arr;
            while (true) {
                arr = keyframesRegex.exec(cssText);
                if (arr === null) {
                    break;
                }
                css.push(arr[0]);
            }
            cssText = cssText.replace(keyframesRegex, '');
            // unified regex
            var unified = new RegExp(combinedCSSRegex, 'gi');
            while (true) {
                arr = unified.exec(cssText);
                if (arr === null) {
                    break;
                }
                css.push(arr[0]);
            }
            return css;
        }
        function fetchCSS(url, sheet) {
            return fetch(url).then(function (res) {
                return {
                    url: url,
                    cssText: res.text()
                };
            }, function (e) {
                console.log('ERROR FETCHING CSS: ', e.toString());
            });
        }
        function embedFonts(data) {
            return data.cssText.then(function (resolved) {
                var cssText = resolved;
                var fontLocations = cssText.match(/url\([^)]+\)/g) || [];
                var fontLoadedPromises = fontLocations.map(function (location) {
                    var url = location.replace(/url\(([^]+)\)/g, '$1');
                    if (!url.startsWith('https://')) {
                        var source = data.url;
                        url = new URL(url, source).href;
                    }
                    return new Promise(function (resolve, reject) {
                        fetch(url).then(function (res) {
                            return res.blob();
                        }).then(function (blob) {
                            var reader = new FileReader();
                            reader.addEventListener('load', function (res) {
                                // Side Effect
                                cssText = cssText.replace(location, "url(" + reader.result + ")");
                                resolve([location, reader.result]);
                            });
                            reader.readAsDataURL(blob);
                        }).catch(reject);
                    });
                });
                return Promise.all(fontLoadedPromises).then(function () {
                    return cssText;
                });
            });
        }
        function getCssRules(styleSheets) {
            var ret = [];
            var promises = [];
            // First loop inlines imports
            styleSheets.forEach(function (sheet) {
                if ('cssRules' in sheet) {
                    try {
                        utils_1.toArray(sheet.cssRules).forEach(function (item) {
                            if (item.type === CSSRule.IMPORT_RULE) {
                                promises.push(fetchCSS(item.href, sheet).then(embedFonts).then(function (cssText) {
                                    var parsed = parseCSS(cssText);
                                    parsed.forEach(function (rule) {
                                        sheet.insertRule(rule, sheet.cssRules.length);
                                    });
                                }).catch(function (e) {
                                    console.log('Error loading remote css', e.toString());
                                }));
                            }
                        });
                    } catch (e) {
                        var inline_1 = styleSheets.find(function (a) {
                            return a.href === null;
                        }) || document.styleSheets[0];
                        if (sheet.href != null) {
                            promises.push(fetchCSS(sheet.href, inline_1).then(embedFonts).then(function (cssText) {
                                var parsed = parseCSS(cssText);
                                parsed.forEach(function (rule) {
                                    inline_1.insertRule(rule, sheet.cssRules.length);
                                });
                            }).catch(function (e) {
                                console.log('Error loading remote stylesheet', e.toString());
                            }));
                        }
                        console.log('Error inlining remote css file', e.toString());
                    }
                }
            });
            return Promise.all(promises).then(function () {
                // Second loop parses rules
                styleSheets.forEach(function (sheet) {
                    if ('cssRules' in sheet) {
                        try {
                            utils_1.toArray(sheet.cssRules).forEach(function (item) {
                                ret.push(item);
                            });
                        } catch (e) {
                            console.log("Error while reading CSS rules from " + sheet.href, e.toString());
                        }
                    }
                });
                return ret;
            });
        }
        function getWebFontRules(cssRules) {
            return cssRules.filter(function (rule) {
                return rule.type === CSSRule.FONT_FACE_RULE;
            }).filter(function (rule) {
                return embedResources_1.shouldEmbed(rule.style.getPropertyValue('src'));
            });
        }
        function parseWebFontRules(clonedNode) {
            return new Promise(function (resolve, reject) {
                if (!clonedNode.ownerDocument) {
                    reject(new Error('Provided element is not within a Document'));
                }
                resolve(utils_1.toArray(clonedNode.ownerDocument.styleSheets));
            }).then(getCssRules).then(getWebFontRules);
        }
        exports.parseWebFontRules = parseWebFontRules;
        function embedWebFonts(clonedNode, options) {
            return parseWebFontRules(clonedNode).then(function (rules) {
                return Promise.all(rules.map(function (rule) {
                    var baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
                    return embedResources_1.default(rule.cssText, baseUrl, options);
                }));
            }).then(function (cssStrings) {
                return cssStrings.join('\n');
            }).then(function (cssString) {
                var styleNode = document.createElement('style');
                var sytleContent = document.createTextNode(cssString);
                styleNode.appendChild(sytleContent);
                if (clonedNode.firstChild) {
                    clonedNode.insertBefore(styleNode, clonedNode.firstChild);
                } else {
                    clonedNode.appendChild(styleNode);
                }
                return clonedNode;
            });
        }
        exports.default = embedWebFonts;
    }, { "./embedResources": 6, "./utils": 10 }], 8: [function (require, module, exports) {
        "use strict";
        /* tslint:disable:max-line-length */

        Object.defineProperty(exports, "__esModule", { value: true });
        var utils_1 = require("./utils");
        // KNOWN ISSUE
        // -----------
        // Can not handle redirect-url, such as when access 'http://something.com/avatar.png'
        // will redirect to 'http://something.com/65fc2ffcc8aea7ba65a1d1feda173540'
        var TIMEOUT = 30000;
        function getBlobFromURL(url, options) {
            // cache bypass so we dont have CORS issues with cached images
            // ref: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
            if (options.cacheBust) {
                url += (/\?/.test(url) ? '&' : '?') + new Date().getTime(); // tslint:disable-line
            }
            var failed = function (reason) {
                var placeholder = '';
                if (options.imagePlaceholder) {
                    var split = options.imagePlaceholder.split(/,/);
                    if (split && split[1]) {
                        placeholder = split[1];
                    }
                }
                var msg = "Failed to fetch resource: " + url;
                if (reason) {
                    msg = typeof reason === 'string' ? reason : reason.message;
                }
                if (msg) {
                    console.error(msg);
                }
                return placeholder;
            };
            var deferred = window.fetch
            // fetch
            ? window.fetch(url).then(function (response) {
                return response.blob();
            }).then(function (blob) {
                return new Promise(function (resolve, reject) {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        return resolve(reader.result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }).then(utils_1.getDataURLContent).catch(function () {
                return new Promise(function (resolve, reject) {
                    reject();
                });
            })
            // xhr
            : new Promise(function (resolve, reject) {
                var req = new XMLHttpRequest();
                var timeout = function () {
                    reject(new Error("Timeout of " + TIMEOUT + "ms occured while fetching resource: " + url));
                };
                var done = function () {
                    if (req.readyState !== 4) {
                        return;
                    }
                    if (req.status !== 200) {
                        reject(new Error("Failed to fetch resource: " + url + ", status: " + req.status));
                        return;
                    }
                    var encoder = new FileReader();
                    encoder.onloadend = function () {
                        resolve(utils_1.getDataURLContent(encoder.result));
                    };
                    encoder.readAsDataURL(req.response);
                };
                req.onreadystatechange = done;
                req.ontimeout = timeout;
                req.responseType = 'blob';
                req.timeout = TIMEOUT;
                req.open('GET', url, true);
                req.send();
            });
            return deferred.catch(failed);
        }
        exports.default = getBlobFromURL;
    }, { "./utils": 10 }], 9: [function (require, module, exports) {
        "use strict";

        var __importDefault = this && this.__importDefault || function (mod) {
            return mod && mod.__esModule ? mod : { "default": mod };
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        var cloneNode_1 = __importDefault(require("./cloneNode"));
        var embedWebFonts_1 = __importDefault(require("./embedWebFonts"));
        var embedImages_1 = __importDefault(require("./embedImages"));
        var createSvgDataURL_1 = __importDefault(require("./createSvgDataURL"));
        var applyStyleWithOptions_1 = __importDefault(require("./applyStyleWithOptions"));
        var utils_1 = require("./utils");
        function getImageSize(domNode, options) {
            if (options === void 0) {
                options = {};
            }
            var width = options.width || utils_1.getNodeWidth(domNode);
            var height = options.height || utils_1.getNodeHeight(domNode);
            return { width: width, height: height };
        }
        function toSvgDataURL(domNode, options) {
            if (options === void 0) {
                options = {};
            }
            var _a = getImageSize(domNode, options),
                width = _a.width,
                height = _a.height;
            return cloneNode_1.default(domNode, options.filter, true).then(function (clonedNode) {
                return embedWebFonts_1.default(clonedNode, options);
            }).then(function (clonedNode) {
                return embedImages_1.default(clonedNode, options);
            }).then(function (clonedNode) {
                return applyStyleWithOptions_1.default(clonedNode, options);
            }).then(function (clonedNode) {
                return createSvgDataURL_1.default(clonedNode, width, height);
            });
        }
        exports.toSvgDataURL = toSvgDataURL;
        function toCanvas(domNode, options) {
            if (options === void 0) {
                options = {};
            }
            return toSvgDataURL(domNode, options).then(utils_1.createImage).then(utils_1.delay(100)).then(function (image) {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var ratio = utils_1.getPixelRatio();
                var _a = getImageSize(domNode, options),
                    width = _a.width,
                    height = _a.height;
                canvas.width = width * ratio;
                canvas.height = height * ratio;
                canvas.style.width = "" + width;
                canvas.style.height = "" + height;
                context.scale(ratio, ratio);
                if (options.backgroundColor) {
                    context.fillStyle = options.backgroundColor;
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }
                context.drawImage(image, 0, 0);
                return canvas;
            });
        }
        exports.toCanvas = toCanvas;
        function toPixelData(domNode, options) {
            if (options === void 0) {
                options = {};
            }
            var _a = getImageSize(domNode, options),
                width = _a.width,
                height = _a.height;
            return toCanvas(domNode, options).then(function (canvas) {
                return canvas.getContext('2d').getImageData(0, 0, width, height).data;
            });
        }
        exports.toPixelData = toPixelData;
        function toPng(domNode, options) {
            if (options === void 0) {
                options = {};
            }
            return toCanvas(domNode, options).then(function (canvas) {
                return canvas.toDataURL();
            });
        }
        exports.toPng = toPng;
        function toJpeg(domNode, options) {
            if (options === void 0) {
                options = {};
            }
            return toCanvas(domNode, options).then(function (canvas) {
                return canvas.toDataURL('image/jpeg', options.quality || 1);
            });
        }
        exports.toJpeg = toJpeg;
        function toBlob(domNode, options) {
            if (options === void 0) {
                options = {};
            }
            return toCanvas(domNode, options).then(utils_1.canvasToBlob);
        }
        exports.toBlob = toBlob;
        exports.default = {
            toSvgDataURL: toSvgDataURL,
            toCanvas: toCanvas,
            toPixelData: toPixelData,
            toPng: toPng,
            toJpeg: toJpeg,
            toBlob: toBlob
        };
    }, { "./applyStyleWithOptions": 1, "./cloneNode": 2, "./createSvgDataURL": 4, "./embedImages": 5, "./embedWebFonts": 7, "./utils": 10 }], 10: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var WOFF = 'application/font-woff';
        var JPEG = 'image/jpeg';
        var mimes = {
            woff: WOFF,
            woff2: WOFF,
            ttf: 'application/font-truetype',
            eot: 'application/vnd.ms-fontobject',
            png: 'image/png',
            jpg: JPEG,
            jpeg: JPEG,
            gif: 'image/gif',
            tiff: 'image/tiff',
            svg: 'image/svg+xml'
        };
        exports.uuid = function uuid() {
            // generate uuid for className of pseudo elements.
            // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
            var counter = 0;
            // ref: http://stackoverflow.com/a/6248722/2519373
            var randomFourChars = function () {
                return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
            };
            return function () {
                counter += 1;
                return "u" + randomFourChars() + counter;
            };
        }();
        function parseExtension(url) {
            var match = /\.([^./]*?)$/g.exec(url);
            if (match) return match[1];
            return '';
        }
        exports.parseExtension = parseExtension;
        function getMimeType(url) {
            var ext = parseExtension(url).toLowerCase();
            return mimes[ext] || '';
        }
        exports.getMimeType = getMimeType;
        function delay(ms) {
            return function (args) {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(args);
                    }, ms);
                });
            };
        }
        exports.delay = delay;
        function createImage(url) {
            return new Promise(function (resolve, reject) {
                var image = new Image();
                image.onload = function () {
                    resolve(image);
                };
                image.onerror = reject;
                image.crossOrigin = 'anonymous';
                image.src = url;
            });
        }
        exports.createImage = createImage;
        function isDataUrl(url) {
            return url.search(/^(data:)/) !== -1;
        }
        exports.isDataUrl = isDataUrl;
        function toDataURL(content, mimeType) {
            return "data:" + mimeType + ";base64," + content;
        }
        exports.toDataURL = toDataURL;
        function getDataURLContent(dataURL) {
            return dataURL.split(/,/)[1];
        }
        exports.getDataURLContent = getDataURLContent;
        function toBlob(canvas) {
            return new Promise(function (resolve) {
                var binaryString = window.atob(canvas.toDataURL().split(',')[1]);
                var len = binaryString.length;
                var binaryArray = new Uint8Array(len);
                for (var i = 0; i < len; i += 1) {
                    binaryArray[i] = binaryString.charCodeAt(i);
                }
                resolve(new Blob([binaryArray], {
                    type: 'image/png'
                }));
            });
        }
        function canvasToBlob(canvas) {
            if (canvas.toBlob) {
                return new Promise(function (resolve) {
                    canvas.toBlob(resolve);
                });
            }
            return toBlob(canvas);
        }
        exports.canvasToBlob = canvasToBlob;
        function toArray(arrayLike) {
            var arr = [];
            for (var i = 0, l = arrayLike.length; i < l; i += 1) {
                arr.push(arrayLike[i]);
            }
            return arr;
        }
        exports.toArray = toArray;
        function px(node, styleProperty) {
            var value = window.getComputedStyle(node).getPropertyValue(styleProperty);
            return parseFloat(value.replace('px', ''));
        }
        function getNodeWidth(node) {
            var leftBorder = px(node, 'border-left-width');
            var rightBorder = px(node, 'border-right-width');
            return node.scrollWidth + leftBorder + rightBorder;
        }
        exports.getNodeWidth = getNodeWidth;
        function getNodeHeight(node) {
            var topBorder = px(node, 'border-top-width');
            var bottomBorder = px(node, 'border-bottom-width');
            return node.scrollHeight + topBorder + bottomBorder;
        }
        exports.getNodeHeight = getNodeHeight;
        function getPixelRatio() {
            return window.devicePixelRatio || 1;
        }
        exports.getPixelRatio = getPixelRatio;
        function svgToDataURL(svg) {
            return Promise.resolve().then(function () {
                return new XMLSerializer().serializeToString(svg);
            }).then(encodeURIComponent).then(function (html) {
                return "data:image/svg+xml;charset=utf-8," + html;
            });
        }
        exports.svgToDataURL = svgToDataURL;
        function getBlobFromImageURL(url) {
            return createImage(url).then(function (image) {
                var width = image.width,
                    height = image.height;
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var ratio = getPixelRatio();
                canvas.width = width * ratio;
                canvas.height = height * ratio;
                canvas.style.width = "" + width;
                canvas.style.height = "" + height;
                context.scale(ratio, ratio);
                context.drawImage(image, 0, 0);
                var dataURL = canvas.toDataURL(getMimeType(url));
                return getDataURLContent(dataURL);
            });
        }
        exports.getBlobFromImageURL = getBlobFromImageURL;
    }, {}], 11: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.FORMATS = exports.FORMAT_PLAIN = exports.FORMAT_HTML = void 0;
        var FORMAT_HTML = "html";
        exports.FORMAT_HTML = FORMAT_HTML;
        var FORMAT_PLAIN = "plain";
        exports.FORMAT_PLAIN = FORMAT_PLAIN;
        var FORMATS = [FORMAT_HTML, FORMAT_PLAIN];
        exports.FORMATS = FORMATS;
    }, {}], 12: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.LINE_ENDINGS = void 0;
        var LINE_ENDINGS = {
            POSIX: "\n",
            WIN32: "\r\n"
        };
        exports.LINE_ENDINGS = LINE_ENDINGS;
    }, {}], 13: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.SUPPORTED_PLATFORMS = void 0;
        var SUPPORTED_PLATFORMS = {
            DARWIN: "darwin",
            LINUX: "linux",
            WIN32: "win32"
        };
        exports.SUPPORTED_PLATFORMS = SUPPORTED_PLATFORMS;
    }, {}], 14: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.WORDS = void 0;
        var WORDS = ["ad", "adipisicing", "aliqua", "aliquip", "amet", "anim", "aute", "cillum", "commodo", "consectetur", "consequat", "culpa", "cupidatat", "deserunt", "do", "dolor", "dolore", "duis", "ea", "eiusmod", "elit", "enim", "esse", "est", "et", "eu", "ex", "excepteur", "exercitation", "fugiat", "id", "in", "incididunt", "ipsum", "irure", "labore", "laboris", "laborum", "Lorem", "magna", "minim", "mollit", "nisi", "non", "nostrud", "nulla", "occaecat", "officia", "pariatur", "proident", "qui", "quis", "reprehenderit", "sint", "sit", "sunt", "tempor", "ullamco", "ut", "velit", "veniam", "voluptate"];
        exports.WORDS = WORDS;
    }, {}], 15: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        Object.defineProperty(exports, "LoremIpsum", {
            enumerable: true,
            get: function get() {
                return _LoremIpsum.default;
            }
        });
        exports.loremIpsum = void 0;

        var _words = require("./constants/words");

        var _LoremIpsum = _interopRequireDefault(require("./lib/LoremIpsum"));

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
        }

        var loremIpsum = function loremIpsum() {
            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref$count = _ref.count,
                count = _ref$count === void 0 ? 1 : _ref$count,
                _ref$format = _ref.format,
                format = _ref$format === void 0 ? "plain" : _ref$format,
                _ref$paragraphLowerBo = _ref.paragraphLowerBound,
                paragraphLowerBound = _ref$paragraphLowerBo === void 0 ? 3 : _ref$paragraphLowerBo,
                _ref$paragraphUpperBo = _ref.paragraphUpperBound,
                paragraphUpperBound = _ref$paragraphUpperBo === void 0 ? 7 : _ref$paragraphUpperBo,
                random = _ref.random,
                _ref$sentenceLowerBou = _ref.sentenceLowerBound,
                sentenceLowerBound = _ref$sentenceLowerBou === void 0 ? 5 : _ref$sentenceLowerBou,
                _ref$sentenceUpperBou = _ref.sentenceUpperBound,
                sentenceUpperBound = _ref$sentenceUpperBou === void 0 ? 15 : _ref$sentenceUpperBou,
                _ref$units = _ref.units,
                units = _ref$units === void 0 ? "sentences" : _ref$units,
                _ref$words = _ref.words,
                words = _ref$words === void 0 ? _words.WORDS : _ref$words,
                _ref$suffix = _ref.suffix,
                suffix = _ref$suffix === void 0 ? "" : _ref$suffix;

            var options = {
                random: random,
                sentencesPerParagraph: {
                    max: paragraphUpperBound,
                    min: paragraphLowerBound
                },
                words: words,
                wordsPerSentence: {
                    max: sentenceUpperBound,
                    min: sentenceLowerBound
                }
            };
            var lorem = new _LoremIpsum.default(options, format, suffix);

            switch (units) {
                case "paragraphs":
                case "paragraph":
                    return lorem.generateParagraphs(count);

                case "sentences":
                case "sentence":
                    return lorem.generateSentences(count);

                case "words":
                case "word":
                    return lorem.generateWords(count);

                default:
                    return "";
            }
        };

        exports.loremIpsum = loremIpsum;
    }, { "./constants/words": 14, "./lib/LoremIpsum": 16 }], 16: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = void 0;

        var _formats = require("../constants/formats");

        var _lineEndings = require("../constants/lineEndings");

        var _generator = _interopRequireDefault(require("../lib/generator"));

        var _util = require("../util");

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
        }

        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }

        function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;
        }

        function _defineProperty(obj, key, value) {
            if (key in obj) {
                Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
            } else {
                obj[key] = value;
            }return obj;
        }

        var LoremIpsum =
        /*#__PURE__*/
        function () {
            function LoremIpsum() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _formats.FORMAT_PLAIN;
                var suffix = arguments.length > 2 ? arguments[2] : undefined;

                _classCallCheck(this, LoremIpsum);

                _defineProperty(this, "generator", void 0);

                _defineProperty(this, "format", void 0);

                _defineProperty(this, "suffix", void 0);

                if (_formats.FORMATS.indexOf(format.toLowerCase()) === -1) {
                    throw new Error("".concat(format, " is an invalid format. Please use ").concat(_formats.FORMATS.join(" or "), "."));
                }

                this.format = format.toLowerCase();
                this.suffix = suffix;
                this.generator = new _generator.default(options);
            }

            _createClass(LoremIpsum, [{
                key: "getLineEnding",
                value: function getLineEnding() {
                    if (this.suffix) {
                        return this.suffix;
                    }

                    if (!(0, _util.isReactNative)() && (0, _util.isNode)() && (0, _util.isWindows)()) {
                        return _lineEndings.LINE_ENDINGS.WIN32;
                    }

                    return _lineEndings.LINE_ENDINGS.POSIX;
                }
            }, {
                key: "formatString",
                value: function formatString(str) {
                    if (this.format === _formats.FORMAT_HTML) {
                        return "<p>".concat(str, "</p>");
                    }

                    return str;
                }
            }, {
                key: "formatStrings",
                value: function formatStrings(strings) {
                    var _this = this;

                    return strings.map(function (str) {
                        return _this.formatString(str);
                    });
                }
            }, {
                key: "generateWords",
                value: function generateWords(num) {
                    return this.formatString(this.generator.generateRandomWords(num));
                }
            }, {
                key: "generateSentences",
                value: function generateSentences(num) {
                    return this.formatString(this.generator.generateRandomParagraph(num));
                }
            }, {
                key: "generateParagraphs",
                value: function generateParagraphs(num) {
                    var makeString = this.generator.generateRandomParagraph.bind(this.generator);
                    return this.formatStrings((0, _util.makeArrayOfStrings)(num, makeString)).join(this.getLineEnding());
                }
            }]);

            return LoremIpsum;
        }();

        var _default = LoremIpsum;
        exports.default = _default;
    }, { "../constants/formats": 11, "../constants/lineEndings": 12, "../lib/generator": 17, "../util": 19 }], 17: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = void 0;

        var _words = require("../constants/words");

        var _util = require("../util");

        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }

        function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;
        }

        function _defineProperty(obj, key, value) {
            if (key in obj) {
                Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
            } else {
                obj[key] = value;
            }return obj;
        }

        var Generator =
        /*#__PURE__*/
        function () {
            function Generator() {
                var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    _ref$sentencesPerPara = _ref.sentencesPerParagraph,
                    sentencesPerParagraph = _ref$sentencesPerPara === void 0 ? {
                    max: 7,
                    min: 3
                } : _ref$sentencesPerPara,
                    _ref$wordsPerSentence = _ref.wordsPerSentence,
                    wordsPerSentence = _ref$wordsPerSentence === void 0 ? {
                    max: 15,
                    min: 5
                } : _ref$wordsPerSentence,
                    random = _ref.random,
                    seed = _ref.seed,
                    _ref$words = _ref.words,
                    words = _ref$words === void 0 ? _words.WORDS : _ref$words;

                _classCallCheck(this, Generator);

                _defineProperty(this, "sentencesPerParagraph", void 0);

                _defineProperty(this, "wordsPerSentence", void 0);

                _defineProperty(this, "random", void 0);

                _defineProperty(this, "words", void 0);

                if (sentencesPerParagraph.min > sentencesPerParagraph.max) {
                    throw new Error("Minimum number of sentences per paragraph (".concat(sentencesPerParagraph.min, ") cannot exceed maximum (").concat(sentencesPerParagraph.max, ")."));
                }

                if (wordsPerSentence.min > wordsPerSentence.max) {
                    throw new Error("Minimum number of words per sentence (".concat(wordsPerSentence.min, ") cannot exceed maximum (").concat(wordsPerSentence.max, ")."));
                }

                this.sentencesPerParagraph = sentencesPerParagraph;
                this.words = words;
                this.wordsPerSentence = wordsPerSentence;
                this.random = random || Math.random;
            }

            _createClass(Generator, [{
                key: "generateRandomInteger",
                value: function generateRandomInteger(min, max) {
                    return Math.floor(this.random() * (max - min + 1) + min);
                }
            }, {
                key: "generateRandomWords",
                value: function generateRandomWords(num) {
                    var _this = this;

                    var _this$wordsPerSentenc = this.wordsPerSentence,
                        min = _this$wordsPerSentenc.min,
                        max = _this$wordsPerSentenc.max;
                    var length = num || this.generateRandomInteger(min, max);
                    return (0, _util.makeArrayOfLength)(length).reduce(function (accumulator, index) {
                        return "".concat(_this.pluckRandomWord(), " ").concat(accumulator);
                    }, "").trim();
                }
            }, {
                key: "generateRandomSentence",
                value: function generateRandomSentence(num) {
                    return "".concat((0, _util.capitalize)(this.generateRandomWords(num)), ".");
                }
            }, {
                key: "generateRandomParagraph",
                value: function generateRandomParagraph(num) {
                    var _this2 = this;

                    var _this$sentencesPerPar = this.sentencesPerParagraph,
                        min = _this$sentencesPerPar.min,
                        max = _this$sentencesPerPar.max;
                    var length = num || this.generateRandomInteger(min, max);
                    return (0, _util.makeArrayOfLength)(length).reduce(function (accumulator, index) {
                        return "".concat(_this2.generateRandomSentence(), " ").concat(accumulator);
                    }, "").trim();
                }
            }, {
                key: "pluckRandomWord",
                value: function pluckRandomWord() {
                    var min = 0;
                    var max = this.words.length - 1;
                    var index = this.generateRandomInteger(min, max);
                    return this.words[index];
                }
            }]);

            return Generator;
        }();

        var _default = Generator;
        exports.default = _default;
    }, { "../constants/words": 14, "../util": 19 }], 18: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = void 0;

        /**
         * @param str  A string that may or may not be capitalized.
         * @returns    A capitalized string.
         */
        var capitalize = function capitalize(str) {
            var trimmed = str.trim();
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        };

        var _default = capitalize;
        exports.default = _default;
    }, {}], 19: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        Object.defineProperty(exports, "capitalize", {
            enumerable: true,
            get: function get() {
                return _capitalize.default;
            }
        });
        Object.defineProperty(exports, "isNode", {
            enumerable: true,
            get: function get() {
                return _isNode.default;
            }
        });
        Object.defineProperty(exports, "isReactNative", {
            enumerable: true,
            get: function get() {
                return _isReactNative.default;
            }
        });
        Object.defineProperty(exports, "isWindows", {
            enumerable: true,
            get: function get() {
                return _isWindows.default;
            }
        });
        Object.defineProperty(exports, "makeArrayOfLength", {
            enumerable: true,
            get: function get() {
                return _makeArrayOfLength.default;
            }
        });
        Object.defineProperty(exports, "makeArrayOfStrings", {
            enumerable: true,
            get: function get() {
                return _makeArrayOfStrings.default;
            }
        });

        var _capitalize = _interopRequireDefault(require("./capitalize"));

        var _isNode = _interopRequireDefault(require("./isNode"));

        var _isReactNative = _interopRequireDefault(require("./isReactNative"));

        var _isWindows = _interopRequireDefault(require("./isWindows"));

        var _makeArrayOfLength = _interopRequireDefault(require("./makeArrayOfLength"));

        var _makeArrayOfStrings = _interopRequireDefault(require("./makeArrayOfStrings"));

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
        }
    }, { "./capitalize": 18, "./isNode": 20, "./isReactNative": 21, "./isWindows": 22, "./makeArrayOfLength": 23, "./makeArrayOfStrings": 24 }], 20: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = void 0;

        /**
         * @returns  True if the runtime is NodeJS.
         */
        var isNode = function isNode() {
            return typeof module !== "undefined" && !!module.exports;
        };

        var _default = isNode;
        exports.default = _default;
    }, {}], 21: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = void 0;

        /**
         * @returns  True if runtime is ReactNative.
         */
        var isReactNative = function isReactNative() {
            return typeof navigator !== "undefined" && navigator.product === "ReactNative";
        };

        var _default = isReactNative;
        exports.default = _default;
    }, {}], 22: [function (require, module, exports) {
        (function (process) {
            "use strict";

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.default = void 0;

            var _platforms = require("../constants/platforms");

            /**
             * @returns True if process is windows.
             */
            var isWindows = function isWindows() {
                return typeof process !== "undefined" && process.platform === _platforms.SUPPORTED_PLATFORMS.WIN32;
            };

            var _default = isWindows;
            exports.default = _default;
        }).call(this, require('_process'));
    }, { "../constants/platforms": 13, "_process": 26 }], 23: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = void 0;

        /**
         * @param length Length "x".
         * @returns      An array of indexes of length "x".
         */
        var makeArrayOfLength = function makeArrayOfLength() {
            var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            return Array.apply(null, Array(length)).map(function (item, index) {
                return index;
            });
        };

        var _default = makeArrayOfLength;
        exports.default = _default;
    }, {}], 24: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = void 0;

        var _ = require(".");

        /**
         * @param length  Length "x".
         * @returns       An array of strings of length "x".
         */
        var makeArrayOfStrings = function makeArrayOfStrings(length, makeString) {
            var arr = (0, _.makeArrayOfLength)(length);
            return arr.map(function () {
                return makeString();
            });
        };

        var _default = makeArrayOfStrings;
        exports.default = _default;
    }, { ".": 19 }], 25: [function (require, module, exports) {
        (function webpackUniversalModuleDefinition(root, factory) {
            if (typeof exports === 'object' && typeof module === 'object') module.exports = factory();else if (typeof define === 'function' && define.amd) define([], factory);else if (typeof exports === 'object') exports["printHtmlElement"] = factory();else root["printHtmlElement"] = factory();
        })(this, function () {
            return (/******/function (modules) {
                    // webpackBootstrap
                    /******/ // The module cache
                    /******/var installedModules = {};

                    /******/ // The require function
                    /******/function __webpack_require__(moduleId) {

                        /******/ // Check if module is in cache
                        /******/if (installedModules[moduleId])
                            /******/return installedModules[moduleId].exports;

                        /******/ // Create a new module (and put it into the cache)
                        /******/var module = installedModules[moduleId] = {
                            /******/exports: {},
                            /******/id: moduleId,
                            /******/loaded: false
                            /******/ };

                        /******/ // Execute the module function
                        /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

                        /******/ // Flag the module as loaded
                        /******/module.loaded = true;

                        /******/ // Return the exports of the module
                        /******/return module.exports;
                        /******/
                    }

                    /******/ // expose the modules object (__webpack_modules__)
                    /******/__webpack_require__.m = modules;

                    /******/ // expose the module cache
                    /******/__webpack_require__.c = installedModules;

                    /******/ // __webpack_public_path__
                    /******/__webpack_require__.p = "";

                    /******/ // Load entry module and return exports
                    /******/return __webpack_require__(0);
                    /******/
                }(
                /************************************************************************/
                /******/[
                /* 0 */
                /***/function (module, exports) {

                    'use strict';

                    /*
                    * Print HTML Element
                    *
                    * Copyright (c) 2015 Philip Da Silva
                    *
                    * Forked from jQuery.printElement (https://github.com/erikzaadi/jQueryPlugins/tree/master/jQuery.printElement)
                    *
                    * Licensed under the MIT license:
                    *   http://www.opensource.org/licenses/mit-license.php
                    */

                    function PrintHtmlElement() {
                        function printElement(element, opts) {
                            var elementHtml = element.outerHTML;

                            _print(elementHtml, opts);
                        }

                        function printHtml(html, opts) {
                            _print(html, opts);
                        }

                        function _print(html, opts) {
                            opts = opts || {};
                            opts = {
                                printMode: opts.printMode || '',
                                pageTitle: opts.pageTitle || '',
                                templateString: opts.templateString || '',
                                popupProperties: opts.popupProperties || '',
                                stylesheets: opts.stylesheets || null,
                                styles: opts.styles || null
                            };

                            // Get markup to be printed
                            var markup = _getMarkup(html, opts),
                                printWindow,
                                printIframe,
                                printDocument,
                                printElementID;

                            if (opts.printMode.toLowerCase() === 'popup') {
                                printWindow = window.open('about:blank', 'printElementWindow', opts.popupProperties);
                                printDocument = printWindow.document;
                            } else {
                                //The random ID is to overcome a safari bug
                                // http://www.cjboco.com.sharedcopy.com/post.cfm/442dc92cd1c0ca10a5c35210b8166882.html
                                printElementID = 'printElement_' + Math.round(Math.random() * 99999).toString();

                                printIframe = document.createElement('iframe');
                                printIframe.setAttribute('id', printElementID);
                                printIframe.setAttribute('src', 'about:blank');
                                printIframe.setAttribute('frameBorder', '0');
                                printIframe.setAttribute('scrolling', 'no');
                                printIframe.setAttribute('style', 'position:fixed;bottom:100%;right:100%;');

                                document.body.appendChild(printIframe);

                                printDocument = printIframe.contentWindow || printIframe.contentDocument;
                                if (printDocument.document) {
                                    printDocument = printDocument.document;
                                }

                                printIframe = document.frames ? document.frames[printElementID] : document.getElementById(printElementID);
                                printWindow = printIframe.contentWindow || printIframe;
                            }

                            focus();
                            printDocument.open();

                            // SetTimeout fixes Issue #9 (iframe printMode does not work in firefox)
                            setTimeout(function () {
                                printDocument.write(markup);
                                printDocument.close();
                            });

                            _callPrint(printWindow, printIframe);
                        }

                        function _callPrint(printWindow, iframe) {
                            if (printWindow && printWindow.printPage) {
                                printWindow.printPage();

                                if (iframe) {
                                    // Remove iframe after printing
                                    document.body.removeChild(iframe);
                                }
                            } else {
                                setTimeout(function () {
                                    _callPrint(printWindow, iframe);
                                }, 50);
                            }
                        }

                        function _getBaseHref() {
                            var port = window.location.port ? ':' + window.location.port : '';
                            return window.location.protocol + '//' + window.location.hostname + port + window.location.pathname;
                        }

                        function _getMarkup(elementHtml, opts) {
                            var template = opts.templateString,
                                templateRegex = new RegExp(/{{\s*printBody\s*}}/gi),
                                stylesheets,
                                styles,
                                html = [];

                            if (template && templateRegex.test(template)) {
                                elementHtml = template.replace(templateRegex, elementHtml);
                            }

                            html.push('<html><head><title>' + (opts.pageTitle || '') + '</title>');

                            // If stylesheet URL's or list of stylesheet URL's are specified, override page stylesheets
                            if (opts.stylesheets) {
                                stylesheets = Array.isArray(opts.stylesheets) ? opts.stylesheets : [opts.stylesheets];
                            } else {
                                stylesheets = Array.prototype.slice.call(document.getElementsByTagName('link')).map(function (link) {
                                    return link.href;
                                });
                            }

                            stylesheets.forEach(function (href) {
                                html.push('<link rel="stylesheet" href="' + href + '">');
                            });

                            // If inline styles or list of inline styles are specified, override inline styles
                            if (opts.styles) {
                                styles = Array.isArray(opts.styles) ? opts.styles : [opts.styles];
                            } else {
                                styles = Array.prototype.slice.call(document.getElementsByTagName('style')).map(function (style) {
                                    return style.innerHTML;
                                });
                            }

                            styles.forEach(function (style) {
                                html.push('<style type="text/css">' + style + '</style>');
                            });

                            // Ensure that relative links work
                            html.push('<base href="' + _getBaseHref() + '" />');
                            html.push('</head><body class="pe-body">');
                            html.push(elementHtml);
                            html.push('<script type="text/javascript">function printPage(){focus();print();' + (opts.printMode.toLowerCase() == 'popup' ? 'close();' : '') + '}</script>');
                            html.push('</body></html>');

                            return html.join('');
                        }

                        return {
                            printElement: printElement,
                            printHtml: printHtml
                        };
                    };

                    module.exports = PrintHtmlElement();

                    /***/
                }
                /******/])
            );
        });
        ;
    }, {}], 26: [function (require, module, exports) {
        // shim for using process in browser
        var process = module.exports = {};

        // cached from whatever global is present so that test runners that stub it
        // don't break things.  But we need to wrap it in a try catch in case it is
        // wrapped in strict mode code which doesn't define any globals.  It's inside a
        // function because try/catches deoptimize in certain engines.

        var cachedSetTimeout;
        var cachedClearTimeout;

        function defaultSetTimout() {
            throw new Error('setTimeout has not been defined');
        }
        function defaultClearTimeout() {
            throw new Error('clearTimeout has not been defined');
        }
        (function () {
            try {
                if (typeof setTimeout === 'function') {
                    cachedSetTimeout = setTimeout;
                } else {
                    cachedSetTimeout = defaultSetTimout;
                }
            } catch (e) {
                cachedSetTimeout = defaultSetTimout;
            }
            try {
                if (typeof clearTimeout === 'function') {
                    cachedClearTimeout = clearTimeout;
                } else {
                    cachedClearTimeout = defaultClearTimeout;
                }
            } catch (e) {
                cachedClearTimeout = defaultClearTimeout;
            }
        })();
        function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) {
                //normal enviroments in sane situations
                return setTimeout(fun, 0);
            }
            // if setTimeout wasn't available but was latter defined
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                cachedSetTimeout = setTimeout;
                return setTimeout(fun, 0);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedSetTimeout(fun, 0);
            } catch (e) {
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                    return cachedSetTimeout.call(null, fun, 0);
                } catch (e) {
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                    return cachedSetTimeout.call(this, fun, 0);
                }
            }
        }
        function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) {
                //normal enviroments in sane situations
                return clearTimeout(marker);
            }
            // if clearTimeout wasn't available but was latter defined
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                cachedClearTimeout = clearTimeout;
                return clearTimeout(marker);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedClearTimeout(marker);
            } catch (e) {
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                    return cachedClearTimeout.call(null, marker);
                } catch (e) {
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                    // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                    return cachedClearTimeout.call(this, marker);
                }
            }
        }
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
            if (!draining || !currentQueue) {
                return;
            }
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue);
            } else {
                queueIndex = -1;
            }
            if (queue.length) {
                drainQueue();
            }
        }

        function drainQueue() {
            if (draining) {
                return;
            }
            var timeout = runTimeout(cleanUpNextTick);
            draining = true;

            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    if (currentQueue) {
                        currentQueue[queueIndex].run();
                    }
                }
                queueIndex = -1;
                len = queue.length;
            }
            currentQueue = null;
            draining = false;
            runClearTimeout(timeout);
        }

        process.nextTick = function (fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                runTimeout(drainQueue);
            }
        };

        // v8 likes predictible objects
        function Item(fun, array) {
            this.fun = fun;
            this.array = array;
        }
        Item.prototype.run = function () {
            this.fun.apply(null, this.array);
        };
        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = ''; // empty string to avoid regexp issues
        process.versions = {};

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.prependListener = noop;
        process.prependOnceListener = noop;

        process.listeners = function (name) {
            return [];
        };

        process.binding = function (name) {
            throw new Error('process.binding is not supported');
        };

        process.cwd = function () {
            return '/';
        };
        process.chdir = function (dir) {
            throw new Error('process.chdir is not supported');
        };
        process.umask = function () {
            return 0;
        };
    }, {}], 27: [function (require, module, exports) {
        if (document.location.pathname !== "/config.html") {
            fetch("/api/config").then(response => response.json()).then(data => {
                if (data.minECTS === 0) {
                    window.location = "http://" + window.location.host + "/config.html";
                }
            });
        }

        switch (document.location.pathname) {
            case "/index.html":
                var ipsum = require("./ipsum.js");
                ipsum.ipsum();
                break;
            case "/course.html":
                require("./course.js");
                break;
            case "/config.html":
                require("./config.js");
                break;
            case "/plans.html":
                require("./plan.js");
                break;
            case "/planEditor.html":
                require("./editor.js");
                break;
            default:
        }
    }, { "./config.js": 28, "./course.js": 29, "./editor.js": 30, "./ipsum.js": 31, "./plan.js": 32 }], 28: [function (require, module, exports) {
        document.getElementById("configForm").addEventListener("submit", function () {
            validateForm();
        });

        function validateForm() {
            var newECTS = document.getElementById("minECTS");
            if (parseInt(newECTS.value) <= 0) {
                showStatus("Zahl muss größer als 0 sein!");
                return;
            } else {
                updateConfig(newECTS.value);
            }
            newECTS.innerHTML = "";
        }

        function showStatus(message) {
            var status = document.getElementById("configStatus");
            status.innerHTML = message;
            status.style.backgroundColor = "red";
            status.style.color = "white";
            setTimeout(function () {
                status.innerHTML = "&nbsp;";
                status.style.backgroundColor = "#f4f4f4";
            }, 3000);
        }

        function updateConfig(ECTS) {
            let ects = {
                minECTS: ECTS
            };
            let options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(ects)
            };
            fetch("/api/config", options).then(response => response.json()).then(data => {
                if (data.message === "success") {
                    localStorage.setItem("minECTS", ECTS);
                    window.location = "http://" + window.location.host + "/index.html";
                }
            });
        }
    }, {}], 29: [function (require, module, exports) {
        document.getElementById("courseForm").addEventListener("submit", function () {
            createCourse();
        });
        var courses = [];

        initTable();

        function initTable() {
            fetch("/api/course").then(response => response.json()).then(message => {
                for (var i = 0; i < message.data.length; i++) {
                    addEntry(message.data[i]);
                }
            });
        }

        function createCourse() {
            var minECTS = localStorage.getItem("minECTS");
            let cName = document.getElementById("courseName");
            let ects = document.getElementById("courseEcts");
            if (parseInt(ects.value) % parseInt(minECTS) !== 0) {
                showStatus("Die ECTS Anzahl muss " + minECTS + " oder ein vielfaches davon betragen!");
                return;
            }
            let course = {
                name: cName.value,
                ects: parseInt(ects.value)
            };
            let options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(course)
            };
            fetch("/api/course", options).then(response => response.json()).then(data => {
                if (data.data) {
                    if (data.data.ects) {
                        let course = {
                            id: data.id,
                            name: data.data.name,
                            ects: data.data.ects
                        };
                        courses.push(course);
                        addEntry(course);
                    }
                }
                if (data.errno) {
                    if (data.errno === 19) {
                        showStatus("Name existiert bereits!!");
                    }
                }
            });
            cName.value = "";
            ects.value = "";
        }

        function showStatus(message) {
            var status = document.getElementById("courseStatus");
            status.innerHTML = message;
            status.style.backgroundColor = "red";
            status.style.color = "white";
            setTimeout(function () {
                status.innerHTML = "&nbsp;";
                status.style.backgroundColor = "#f4f4f4";
            }, 3000);
        }

        function addEntry(course) {
            var tr = document.createElement("tr");
            tr.id = course.id;
            var tdname = document.createElement("td");
            tdname.innerText = course.name;
            tr.appendChild(tdname);
            var tdects = document.createElement("td");
            tdects.innerText = course.ects;
            tr.appendChild(tdects);
            var tdfunct = document.createElement("td");
            var delbutton = document.createElement("button");
            var editbutton = document.createElement("button");
            editbutton.id = course.id + "_edit";
            delbutton.id = course.id + "_del";
            delbutton.innerText = "delete";
            editbutton.innerText = "edit";
            tdfunct.appendChild(delbutton);
            tdfunct.appendChild(editbutton);
            tr.appendChild(tdfunct);
            document.getElementById("courseTable").appendChild(tr);
            delbutton.addEventListener("click", function () {
                deleteCourse(course.id);
            });
            editbutton.addEventListener("click", function () {
                editCourse(course.id);
            });
        }

        function removeEntry(id) {
            var entry = document.getElementById(id);
            entry.parentNode.removeChild(entry);
        }

        function updateEntry(id, name) {
            document.getElementById(id).firstChild.innerText = name;
        }

        function deleteCourse(id) {
            let options = {
                method: "DELETE"
            };
            fetch("/api/course/" + id, options);
            removeEntry(id);
        }

        function editCourse(id) {
            var newname = prompt("Please enter new name");
            if (newname !== "" && newname !== null) {
                var course = {
                    name: newname
                };
                let options = {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(course)
                };
                fetch("api/course/" + id, options).then(response => response.json()).then(data => {
                    if (data.errno === 19) {
                        showStatus("Name " + newname + " existiert bereits!!");
                    }
                    if (data.message === "success") {
                        updateEntry(id, newname);
                    }
                });
            } else {
                showStatus("Name kann nicht leer sein!");
            }
        }
    }, {}], 30: [function (require, module, exports) {
        var link = window.location.href; //http.... id?=1
        var tempid = link.slice(-2); // id?= <=
        var id;
        if (Number.isInteger(tempid.charAt(0))) {
            id = tempid;
        } else {
            id = link.slice(-1);
        }

        const minECTS = localStorage.getItem("minECTS");
        var plan;
        var remECTS = [];
        var contains = [];
        var rows = [];

        function showEditor() {
            document.getElementById("planBox").innerHTML = "";
            fetch("/api/plan/" + id).then(response => response.json()).then(data => {
                plan = data;
                addEntry(data);
                setCourseNames();
            });
        }

        showEditor();

        function addEntry(plan) {
            var planBox = document.getElementById("planBox");
            var table = document.createElement("table");
            table.id = plan.id;

            var thead = document.createElement("tr");
            thead.className = "thead";
            var sem = document.createElement("td");
            sem.innerText = "Sem";
            var head = document.createElement("td");
            head.setAttribute("colspan", plan.maxECTS / minECTS);
            head.innerText = plan.name;
            head.id = "PlanName";
            var functBox = document.createElement("td");
            var editNameButton = document.createElement("button");
            editNameButton.innerText = "Edit Name";
            editNameButton.addEventListener("click", function () {
                editName();
            });
            functBox.appendChild(editNameButton);
            localStorage.setItem("planname" + plan.id, plan.name);
            head.className = "planTitle";

            thead.append(sem, head, functBox);
            table.append(thead);

            for (var i = plan.semCount; i > 0; i--) {
                addSemester(i, plan, table);
            }

            var footer = document.createElement("tfoot");
            var ectsTd = document.createElement("td");
            ectsTd.innerText = "ECTS";
            footer.appendChild(ectsTd);
            for (var l = 0; l < plan.maxECTS / minECTS; l++) {
                var ectsDisplay = document.createElement("td");
                ectsDisplay.innerText = minECTS;
                footer.appendChild(ectsDisplay);
            }

            localStorage.setItem("table" + plan.id, table.innerHTML);

            table.append(footer);

            planBox.appendChild(table);
            planBox.appendChild(document.createElement("br"));
        }

        function addSemester(i, plan, table) {
            var rowArr = [];
            var remainingECTS = plan.maxECTS;
            var row = document.createElement("tr");
            row.className = "planRow";
            var semNumber = document.createElement("td");
            semNumber.innerText = i;
            semNumber.className = "semNum";
            row.appendChild(semNumber);
            for (var j in plan.semesters[i - 1]) {
                rowArr.push(plan.semesters[i - 1][j].id);
                var course = document.createElement("td");
                remainingECTS -= minECTS * plan.semesters[i - 1][j].span;
                course.setAttribute("colspan", plan.semesters[i - 1][j].span);
                course.className = "course";
                course.innerText = plan.semesters[i - 1][j].id + "_id";
                course.id = plan.semesters[i - 1][j].id + "_course";
                row.appendChild(course);
                contains.push(plan.semesters[i - 1][j].id);
            }
            if (remainingECTS !== 0) {
                var emptyBlock = document.createElement("td");
                emptyBlock.setAttribute("colspan", remainingECTS / minECTS);
                emptyBlock.id = "empty_" + i;
                row.appendChild(emptyBlock);
            }
            var buttons = document.createElement("td");
            buttons.id = "buttons_" + i;
            var addButton = document.createElement("button");
            addButton.innerText = "+";
            addButton.id = "add_" + i;
            if (remainingECTS === 0) {
                addButton.setAttribute("disabled", "disabled");
            }
            var removeButton = document.createElement("button");
            removeButton.innerText = "-";
            addButton.id = "remove_" + i;
            if (remainingECTS === plan.maxECTS) {
                removeButton.setAttribute("disabled", "disabled");
            }
            rows[i - 1] = rowArr;
            addButton.addEventListener("click", function () {
                addcourse(i, addButton, removeButton);
            });
            removeButton.addEventListener("click", function () {
                removecourse(i, addButton, removeButton);
            });
            buttons.append(addButton, removeButton);
            row.appendChild(buttons);
            remECTS[i - 1] = parseInt(remainingECTS);
            table.append(row);
        }

        function setCourseNames() {
            fetch("/api/course").then(response => response.json()).then(message => {
                var modules = document.getElementsByClassName("course");
                for (var i = 0; i < modules.length; i++) {
                    var oldText = modules[i].innerText;
                    for (var j = 0; j < message.data.length; j++) {
                        var courseId = message.data[j].id;
                        if (modules[i].innerText === courseId + "_id") {
                            modules[i].innerText = message.data[j].name;
                        }
                    }
                    if (oldText === modules[i].innerText) {
                        var ret = oldText.replace("_id", "");
                        for (var l = 0; l < plan.semesters.length; l++) {
                            for (var k = 0; k < plan.semesters[l].length; k++) {
                                if (plan.semesters[l][k].id === parseInt(ret)) {
                                    plan.semesters[l].splice(k, 1);
                                    applyChange();
                                    location.reload();
                                }
                            }
                        }
                    }
                }
            });
        }

        function editName() {
            var newname = prompt("Please enter new name");
            if (newname !== "" && newname !== null) {
                var newplan = plan;
                newplan.name = newname;
                let options = {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newplan)
                };
                fetch("api/plan/" + id, options).then(response => response.json()).then(data => {
                    if (data.errno === 19) {
                        showStatus("Name " + newname + " existiert bereits!!");
                    }
                    if (data.message === "success") {
                        document.getElementById("PlanName").innerText = newname;
                    }
                });
            } else {
                showStatus("Name kann nicht leer sein!");
            }
        }

        function addcourse(semester, addB, remB) {
            fetch("api/course/").then(response => response.json()).then(message => {
                var courses = [];
                var validId = [];
                var text = "";
                for (var i = 0; i < message.data.length; i++) {
                    var course = message.data[i];
                    if (!contains.includes(course.id) && course.ects <= remECTS[semester - 1]) {
                        courses.push(course);
                        validId.push(course.id);
                        text += course.id + ": " + course.name + " (" + course.ects + " ECTS)\n";
                    }
                }
                var entry = prompt("Chose Subject by id: \n" + text);
                if (entry) {
                    if (entry === null || entry === "") {
                        showStatus("Eingabe darf nicht leer sein!");
                    } else {
                        if (validId.includes(parseInt(entry))) {
                            var newCourse;
                            for (var j = 0; j < courses.length; j++) {
                                if (courses[j].id === parseInt(entry)) {
                                    newCourse = courses[j];
                                    break;
                                }
                            }
                            remECTS[semester - 1] -= newCourse.ects;
                            var td = document.createElement("td");
                            td.innerText = newCourse.name;
                            td.setAttribute("colspan", newCourse.ects / minECTS);
                            td.id = newCourse.id + "_course";
                            contains.push(newCourse.id);
                            var block = document.getElementById("empty_" + semester);
                            var parent = block.parentElement;
                            parent.insertBefore(td, block);
                            if (remECTS[semester - 1] === 0) {
                                block.parentElement.removeChild(block);
                                addB.setAttribute("disabled", "disabled");
                                remB.removeAttribute("disabled");
                            } else {
                                block.setAttribute("colspan", remECTS[semester - 1] / minECTS);
                                remB.removeAttribute("disabled");
                            }
                            var planCourse = {
                                id: newCourse.id,
                                span: newCourse.ects / minECTS
                            };
                            plan.semesters[semester - 1].push(planCourse);
                            rows[semester - 1].push(newCourse.id);
                            applyChange();
                        } else {
                            showStatus("id nicht bekannt!");
                        }
                    }
                }
            });
        }

        function removecourse(semester, addB, remB) {
            fetch("api/course/").then(response => response.json()).then(message => {
                var validId = rows[semester - 1];
                var text = "";
                for (var i = 0; i < message.data.length; i++) {
                    var course = message.data[i];
                    if (validId.includes(course.id)) {
                        text += course.id + ": " + course.name + " (" + course.ects + " ECTS)\n";
                    }
                }
                var entry = prompt("Chose Subject by id: \n" + text);
                if (entry) {
                    if (entry === null || entry === "") {
                        showStatus("Eingabe darf nicht leer sein!");
                    } else {
                        if (validId.includes(parseInt(entry))) {
                            var td2del = document.getElementById(entry + "_course");
                            var span = td2del.getAttribute("colspan");
                            remECTS[semester - 1] += span * minECTS;
                            td2del.parentElement.removeChild(td2del);
                            var block = document.getElementById("empty_" + semester);
                            if (block !== null) {
                                block.setAttribute("colspan", remECTS[semester - 1] / minECTS);
                            } else {
                                block = document.createElement("td");
                                block.setAttribute("colspan", remECTS[semester - 1] / minECTS);
                                block.id = "empty_" + semester;
                                var buttons = document.getElementById("buttons_" + semester);
                                var parent = buttons.parentElement;
                                parent.insertBefore(block, buttons);
                            }
                            for (var j = 0; j < plan.semesters[semester - 1].length; j++) {
                                if (plan.semesters[semester - 1][j].id === parseInt(entry)) {
                                    plan.semesters[semester - 1].splice(j, 1);
                                    break;
                                }
                            }
                            var containsIndex = contains.indexOf(parseInt(entry));
                            contains.splice(containsIndex, 1);
                            var rowsIndex = rows[semester - 1].indexOf(parseInt(entry));
                            rows[semester - 1].splice(rowsIndex, 1);
                            addB.removeAttribute("disabled");
                            if (remECTS[semester - 1] === 0) {
                                remB.setAttribute("disabled", "disabled");
                            }
                            applyChange();
                        } else {
                            showStatus("id nicht bekannt!");
                        }
                    }
                }
            });
        }

        function applyChange() {
            let options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(plan)
            };
            fetch("api/plan/" + id, options).then(response => response.json()).then(data => {
                if (data.errno) {
                    showStatus("Es ist ein Fehler ausgetretten!");
                }
            });
        }

        function showStatus(message) {
            var status = document.getElementById("planStatus");
            status.innerHTML = message;
            status.style.backgroundColor = "red";
            status.style.color = "white";
            setTimeout(function () {
                status.innerHTML = "&nbsp;";
                status.style.backgroundColor = "#f4f4f4";
            }, 3000);
        }
    }, {}], 31: [function (require, module, exports) {
        const loremIpsum = require("lorem-ipsum").loremIpsum;

        function ipsum() {
            document.getElementById("Text").innerHTML = loremIpsum({ count: 2, units: "paragraphs" });
            setInterval(function () {
                document.getElementById("Text").innerHTML = loremIpsum({ count: 2, units: "paragraphs" });
            }, 5000);
        }

        exports.ipsum = ipsum;
    }, { "lorem-ipsum": 15 }], 32: [function (require, module, exports) {
        document.getElementById("planForm").addEventListener("submit", function () {
            createPlan();
        });
        const htmlToImage = require("html-to-image");
        var PHE = require("print-html-element");
        const minECTS = localStorage.getItem("minECTS");
        window.addEventListener("resize", function () {
            checkSpace();
        });
        var curItems = -1;

        // Reserved Screenheight = 230px, Screenheight 8 Semester = 400px

        function checkSpace() {
            var items = Math.floor((document.documentElement.clientHeight - 230) / 310);
            if (items !== curItems) {
                curItems = items;
                showPlans(1, items);
            }
            if (items <= 0) {
                document.getElementById("pages").innerHTML = "";
                document.getElementById("planBox").innerHTML = "";
                var message = document.createElement("p");
                message.innerText = "Fenster ist zu klein! Bitten vergrößern sie das Fenster.";
                message.style.textAlign = "center";
                document.getElementById("planBox").appendChild(message);
            }
        }

        checkSpace();

        function showPlans(page, items) {
            document.getElementById("planBox").innerHTML = "";
            fetch("/api/plan?page=" + page + "&items=" + items).then(response => response.json()).then(data => {
                for (var i = 0; i < data.data.length; i++) {
                    addEntry(data.data[i]);
                }
                setCourseNames();
                if (data.data.length > 0) {
                    createPagination(Math.ceil(data.total / items), page, items);
                }
            });
        }

        function createPagination(pages, currentPage, items) {
            var parent = document.getElementById("pages");
            parent.innerHTML = "";
            var previous = document.createElement("button");
            previous.className = "disabledButton";
            previous.innerText = "<<";
            parent.appendChild(previous);
            if (currentPage !== 1) {
                previous.className = "pageButton";
                previous.addEventListener("click", function () {
                    showPlans(currentPage - 1, items);
                });
            }
            for (var i = 1; i <= pages; i++) {
                addPageButton(currentPage, i, items);
            }
            var next = document.createElement("button");
            next.className = "disabledButton";
            next.innerText = ">>";
            parent.appendChild(next);
            if (currentPage !== pages) {
                next.className = "pageButton";
                next.addEventListener("click", function () {
                    showPlans(currentPage + 1, items);
                });
            }
        }

        function addPageButton(currentPage, i, items) {
            var parent = document.getElementById("pages");
            var pageBtn = document.createElement("button");
            pageBtn.addEventListener("click", function () {
                showPlans(i, items);
            });
            pageBtn.innerText = i;
            pageBtn.id = "page" + i;
            if (i === currentPage) {
                pageBtn.className = "pageButtonCurrent";
            } else {
                pageBtn.className = "pageButton";
            }
            parent.appendChild(pageBtn);
        }

        function addEntry(plan) {
            var planBox = document.getElementById("planBox");
            var table = document.createElement("table");
            table.id = plan.id;

            var thead = document.createElement("tr");
            thead.className = "thead";
            var sem = document.createElement("td");
            sem.innerText = "Sem";
            var head = document.createElement("td");
            head.setAttribute("colspan", plan.maxECTS / minECTS);
            head.innerText = plan.name;
            localStorage.setItem("planname" + plan.id, plan.name);
            head.className = "planTitle";

            thead.append(sem, head);
            table.append(thead);

            for (var i = plan.semCount; i > 0; i--) {
                var remainingECTS = plan.maxECTS;
                localStorage.setItem("maxECTS" + plan.id, remainingECTS);
                var row = document.createElement("tr");
                row.className = "planRow";
                var semNumber = document.createElement("td");
                semNumber.innerText = i;
                semNumber.className = "semNum";
                row.appendChild(semNumber);
                for (var j in plan.semesters[i - 1]) {
                    var course = document.createElement("td");
                    remainingECTS -= minECTS * plan.semesters[i - 1][j].span;
                    course.setAttribute("colspan", plan.semesters[i - 1][j].span);
                    course.className = "course";
                    course.innerText = plan.semesters[i - 1][j].id + "_id";
                    row.appendChild(course);
                }
                if (remainingECTS !== 0) {
                    for (var k = 0; k < remainingECTS / minECTS; k++) {
                        var defModule = document.createElement("td");
                        defModule.setAttribute("colspan", 1);
                        defModule.innerText = "Wahlpflichtmodul";
                        row.appendChild(defModule);
                    }
                }
                table.append(row);
            }

            var footer = document.createElement("tfoot");
            var ectsTd = document.createElement("td");
            ectsTd.innerText = "ECTS";
            footer.appendChild(ectsTd);
            for (var l = 0; l < plan.maxECTS / minECTS; l++) {
                var ectsDisplay = document.createElement("td");
                ectsDisplay.innerText = minECTS;
                footer.appendChild(ectsDisplay);
            }

            var buttons = document.createElement("caption");
            buttons.setAttribute("colspan", plan.maxECTS / minECTS + 1);
            var delbutton = document.createElement("button");
            var editbutton = document.createElement("button");
            var downloadbutton = document.createElement("button");
            var printbutton = document.createElement("button");
            delbutton.innerText = "delete";
            editbutton.innerText = "edit";
            downloadbutton.innerText = "to PNG";
            printbutton.innerText = "Print...";
            buttons.appendChild(delbutton);
            buttons.appendChild(editbutton);
            buttons.appendChild(downloadbutton);
            buttons.appendChild(printbutton);
            delbutton.addEventListener("click", function () {
                deletePlan(plan.id);
            });
            editbutton.addEventListener("click", function () {
                editPlan(plan.id);
            });
            downloadbutton.addEventListener("click", function () {
                downloadPlan(plan.id);
            });
            printbutton.addEventListener("click", function () {
                printPlan(plan.id);
            });
            localStorage.setItem("table" + plan.id, table.innerHTML);

            table.append(footer, buttons);

            planBox.appendChild(table);
            planBox.appendChild(document.createElement("br"));
        }

        function setCourseNames() {
            fetch("/api/course").then(response => response.json()).then(message => {
                var modules = document.getElementsByClassName("course");
                for (var i = 0; i < modules.length; i++) {
                    var oldText = modules[i].innerText;
                    for (var j = 0; j < message.data.length; j++) {
                        var courseId = message.data[j].id;
                        if (modules[i].innerText === courseId + "_id") {
                            modules[i].innerText = message.data[j].name;
                        }
                    }
                    if (oldText === modules[i].innerText) {
                        modules[i].innerText = "Wahlpflichtmodul";
                        if (modules[i].getAttribute("colspan") > 1) {
                            var currentSpan = modules[i].getAttribute("colspan");
                            modules[i].setAttribute("colspan", 1);
                            for (var k = 1; k < currentSpan; k++) {
                                var td = document.createElement("td");
                                td.innerText = "Wahlpflichtmodul";
                                modules[i].parentElement.appendChild(td);
                            }
                        }
                    }
                }
            });
        }

        function removeEntry(id) {
            var entry = document.getElementById(id);
            entry.parentNode.removeChild(entry);
        }

        function downloadPlan(id) {
            var plan = document.getElementById(id);
            plan.style.margin = "1px";
            htmlToImage.toPng(plan).then(function (dataUrl) {
                var a = document.body.appendChild(document.createElement("a"));
                a.download = "plan_" + id + ".png";
                a.href = dataUrl;
                a.click();
                document.body.removeChild(a);
                plan.style.margin = "auto";
            });
        }

        function printPlan(id) {
            var plan = document.getElementById(id);
            PHE.printElement(plan);
        }

        function createPlan() {
            var name = document.getElementById("planName").value;
            var sem = document.getElementById("semCount").value;
            var mod = document.getElementById("modCount").value;
            if (sem > 0) {
                if (mod % minECTS === 0) {
                    let plan = {
                        name: name,
                        sem: sem,
                        maxECTS: mod
                    };
                    let options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(plan)
                    };
                    fetch("/api/plan", options).then(response => response.json()).then(data => {
                        if (data.message) {
                            if (data.message === "success") {
                                editPlan(data.id);
                            }
                        }
                        if (data.errno) {
                            if (data.errno === 19) {
                                showStatus("Name ist bereits vergeben.");
                            }
                        }
                    });
                } else {
                    showStatus("Die ECTS Anzahl muss " + minECTS + " oder ein vielfaches davon betragen!");
                }
            } else {
                showStatus("Es muss mindestens 1 Semester sein.");
            }
        }

        function editPlan(id) {
            window.location = "/planEditor.html?id=" + id;
            localStorage.setItem("id", id);
        }

        function deletePlan(id) {
            let options = {
                method: "DELETE"
            };
            fetch("/api/plan/" + id, options);
            removeEntry(id);
        }

        function showStatus(message) {
            var status = document.getElementById("planStatus");
            status.innerHTML = message;
            status.style.backgroundColor = "red";
            status.style.color = "white";
            setTimeout(function () {
                status.innerHTML = "&nbsp;";
                status.style.backgroundColor = "#f4f4f4";
            }, 3000);
        }
    }, { "html-to-image": 9, "print-html-element": 25 }] }, {}, [27]);

