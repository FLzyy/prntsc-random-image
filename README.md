# PrntSc Random Image

Pull a certain amount of images from [prnt.sc](https://prnt.sc/) and uploads them to a [imgur](https://imgur.com/upload) Gallery.

I wouldn't recommend using this without a vpn/proxy as it is possible to get IP banned.

***

## Usage

To use this script start it with the following command:

```text
npm start
```

After executing it you should see something like this

```text
? Choose Saving Method (Use arrow keys)
❯ Save to Imgur Gallery
  Save to Output Directory
```

`Save to Imgur Gallery` - Saves to `./temp/` and uploads [imgur](https://imgur.com/upload), logs the link to it and deletes temp files on completion.

`Save to Output Directory` - Saves to the images to ``./Out/`` and is saved permanently.

After you should see something like this:

```text
? Choose Saving Method Save to Output Directory
? Amount of Images:
```

This option will only accept integers any decimals will be floored as well.

Now your images should be saved to either [imgur](https://imgur.com/upload/) or the local `Out` directory.
