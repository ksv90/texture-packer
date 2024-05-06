# texture-packer

## to install the package
```bash
npm install @ksv90/texture-packer
```

## to pack textures
```bash
npx assets-pack assets-config.json
```

## config
A config is a json file described according to the *schemas/config-schema.json* scheme.  
For autocomplete, the schema can be included in the configuration file: ```"$schema": "./node_modules/@ksv90/texture-packer/schemas/config-schema.json"```

## examples
In the *examples* directory on github you can see a simple working example of a configuration file and texture packaging. Locally, you can run packaging using the assets-pack script from the package.json file.
```json
{
  "$schema": "./node_modules/@ksv90/texture-packer/schemas/config-schema.json",
  "settings": [
    {
      "sourceDir": "examples",
      "targetDir": "examples/public",
      "sourceList": ["textures"],
      "details": {
        "textures": {
          "t3.png": { "scale": 0.5 },
          "t1.png": { "scale": 0.25 }
        }
      },
      "addTextures": {
        "textures": ["add/t5.png"]
      },
      "output": [
        { "format": "png", "width": 4096, "height": 4096, "suffix": "@1.0" },
        { "format": "webp", "width": 2048, "height": 2048, "subDir": "webp" }
      ]
    }
  ]
}
```

## settings
The configuration file accepts an array of settings. The settings are needed for the packager so that he understands what needs to be done.  
The configuration below shows how parameters can be passed for multiple input points.
```json
{
  "settings": [
    {
      "sourceDir": "assets",
      "targetDir": "public",
      "sourceList": ["directory-one", "directory-two"],
      "subDir": "desktop",
      "output": [{ "format": "webp", "subDir": "desktop", "width": 1024, "height": 1024 }]
    },
    {
      "sourceDir": "assets",
      "targetDir": "public",
      "sourceList": ["directory-one", "directory-two"],
      "subDir": "mobile",
      "output": [{ "format": "webp", "subDir": "mobile", "width": 1024, "height": 1024 }]
    }
  ]
}
```
The optional subDir parameters for settings and output are specified here. This settings will read files in directories and write the result to disk like this:  
```assets/directory-one/desktop/**``` -> ```public/directory-one/desktop/**```  
```assets/directory-two/desktop/** ```-> ```public/directory-two/desktop/**```  
```assets/directory-one/mobile/**``` -> ```public/directory-one/mobile/**```  
```assets/directory-two/mobile/**``` -> ```public/directory-two/mobile/**```  

## output
In turn, the read stream can be converted into several output streams.  
Below is the export in WebP and PNG formats:
```json
{
  "settings": [
    {
      "sourceDir": "assets",
      "targetDir": "public",
      "sourceList": ["directory-one", "directory-two"],
      "output": [
        { "format": "webp", "subDir": "webp", "width": 1024, "height": 1024 },
        { "format": "png", "subDir": "png", "width": 1024, "height": 1024 }
      ]
    }
  ]
}
```

## output params
You can set various parameters for the output stream:  
- width - maximum output sprite width
- height - maximum output sprite height
- scale - scale - to resize the texture before adding it to the output sprite
- name - the name of the output sprite and configuration file (default - ```sprite```)
- suffix - postscript after the output file name (```"suffix": "@1.0"``` -> ```sprite@1.0.png```)
- background — background color of the output file (relevant for jpg format)
- metaScale - prints information to the sprite configuration file that the texture scale has been changed (for example, if you specify a value of 2, pixi.js will automatically reduce the size by 2 times)

## details
If you need detailed settings for each texture, you can specify parameters in the ```details``` field:
```json
{
  "settings": [
    {
      "sourceDir": "assets",
      "targetDir": "public",
      "sourceList": ["directory-one", "directory-two"],
      "details": {
        "directory-one": {
          "texture-1": {
            "scale": 0.5
          }
        }
      },
      "output": [{ "format": "webp", "width": 1024, "height": 1024, "scale": 0.5 }]
    }
  ]
}
```
Here, for all textures in the directories ```directory-one``` and ```directory-two``` a scale of 0.5 will be applied. And for the texture called ```texture-1.png``` in the ```directory-one``` directory, a scale of 0.25 will be applied (multiplying the values 0.5 * 0.5)

## add-textures
Sometimes it can be useful to add a texture from a different directory to the sprite. This can be done using addTextures:
```json
{
  "settings": [
    {
      "sourceDir": "assets",
      "targetDir": "public",
      "sourceList": ["directory-one", "directory-two"],
      "addTextures": {
        "directory-one": ["other-directory/special-texture.png"]
      },
      "output": [{ "format": "webp", "width": 1024, "height": 1024 }]
    }
  ]
}
```
Here, the output sprite   ```directory-one``` will contain textures from the ```assets/directory-one``` directory, as well as the ```assets/other-directory/special-texture.png``` texture. The output sprite ```directory-two``` will only contain textures from ```assets/directory-two```.

## allow-rotation
By default, the packer flips textures if it helps reduce the size of the output sprite. With the ```allowRotation``` setting you can disable this behavior:
```json
{
  "allowRotation": false,
  "settings": [
    {
      "targetDir": "assets",
      "sourceList": ["textures"],
      "output": [{ "format": "webp", "width": 1024, "height": 1024 }]
    }
  ]
}
```

## cache
By default, after packaging, a simple cache will be created to optimize the repackaging process.  
If this is not what you need, you can disable it by setting "cache": false. You can also specify the name and location of the cache information file using the cacheName parameter:
```json
{
  "cache": true,
  "cacheName": "public/.assets-cache",
  "settings": [
    {
      "targetDir": "public",
      "sourceList": ["textures"],
      "output": [{ "format": "webp", "width": 1024, "height": 1024 }]
    }
  ]
}
```
