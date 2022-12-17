import sys
import cv2
import numpy


(path, image_path, width, heigth) = sys.argv


image = cv2.imread(image_path)
print('[PYTHON RESIZE] open image {0}'.format(image_path))
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

faceCascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
faces = faceCascade.detectMultiScale(
    gray,
    scaleFactor=1.2,
    minNeighbors=7,
    minSize=(30, 30)
)
print('[PYTHON RESIZE]found {0} faces'.format(len(faces)))
(im_heigth,im_width,ch) = image.shape

if (len(faces) > 0):
        (x, y, w, h) = faces[0]

        print('[PYTHON RESIZE] image > width:{0} height:{1}'.format(im_width,im_heigth))
        margin_x_left = min(numpy.int32((int(width) - w ) / 2),x)
        margin_y_top = min(numpy.int32((int(heigth) - h ) / 2),y)
        margin_y_bottom = min(numpy.int32((int(heigth) - h ) / 2),im_heigth-(y+h))
        margin_x_right = min(numpy.int32((int(width) - w ) / 2),im_width -(x+w))
        margin_x = min(margin_x_right,margin_x_left)
        margin_y = min(margin_y_bottom,margin_y_top)
        print('[PYTHON RESIZE]margin-y: {0}'.format(margin_y))
        print('[PYTHON RESIZE]margin-x: {0}'.format(margin_x))
        face_coord = image[y - margin_y:y + h + margin_y, x - margin_x:x + w + margin_x]
        status = cv2.imwrite(image_path, face_coord)
        print('[PYTHON RESIZE]image saved {0}'.format(status))

else:
   
     dim = (int(width),int(heigth))
     resized = cv2.resize(image,dim,interpolation=cv2.INTER_NEAREST)
     status = cv2.imwrite(image_path,resized)
     print('image saved {0}'.format(status))
        
