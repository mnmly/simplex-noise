# simplex-noise

☞ [Demo](http://mnmly.github.io/simplex-noise/)
[![](http://f.cl.ly/items/2V0y1x203g0w3T1A1z2P/Image%202013.05.25%209%3A57%3A50%20AM.png)](http://mnmly.github.io/simplex-noise/)



Simplex Perlin Noise Generator

> Ported from [Stefan Gustavson's java implementation](http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf)
> Read Stefan's excellent paper for details on how this code works.

This `component` version is cloned from the [gist](https://gist.github.com/banksean/304522) by [Sean McCullough](https://github.com/banksean)
  
  

## Installation

    $ component install mnmly/simplex-noise

## Usage

```javascript

  var Noise = require('simplex-noise')
    , generator = new ClassicalNoise();
  
  // => returns number between `[-1, 1]`
  console.log(generator.noise(0.001, 0, 0));

  // => returns random number but close enough to the value above.
  console.log(generator.noise(0.001 + 0.001, 0, 0));
```

## License

  MIT
