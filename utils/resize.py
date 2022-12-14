from PIL import Image
import sys

(path,image_path,width,heigth) = sys.argv
print(sys.argv)

try: 
    image = Image.open(image_path)
    image.thumbnail((int(heigth),int(width)))
    image.save(image_path)
    print('resized')

except IOError: print('File error',)
