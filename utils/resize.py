import sys
import cv2
import numpy


(path, image_path, width, heigth) = sys.argv

width = int(width)
heigth = int(heigth)

def resizeBySize(image,width,heigth):
    (img_h,img_w,ch) = image.shape
    print('[-INFO-]: image heigth > {0}; image width > {1}'.format(img_h,img_w))
    print('[-INFO-]: req heigth > {0}; req width > {1}'.format(heigth,width))
    rate = max(img_w,width) / min(img_w,width) 
    print('[-INFO-]: rate > {0}'.format(rate))
    dim = (int(img_w / rate),int(img_h / rate)) if (int(img_w) > width) | (int(img_h) > heigth) else (int(img_w * rate),int(img_h * rate))
    print(dim)
    resized = cv2.resize(image,dim,interpolation=cv2.INTER_AREA)
    (h,w,c) = resized.shape
    print('[-INFO-]: resized width > {0}; resized heigth > {1}'.format(w,h))
    return resized


####-Searching faces-#############

image = cv2.imread(image_path)
print('[-PYTHON RESIZE-]: open image {0}'.format(image_path))
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

faceCascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
faces = faceCascade.detectMultiScale(
    gray,
    scaleFactor=1.2,
    minNeighbors=8,
    minSize=(80, 80)
)
print('[-PYTHON RESIZE-]: found {0} faces'.format(len(faces)))
#################################

#-Saving bordered faces image-###
# cp_image = image.copy()
# for (x,y,w,h) in faces:
#     cv2.rectangle(cp_image,(x,y),(x+w,y+h),(0,255,0),4)

# cv2.imwrite('face_detected.jpg',cp_image)

#################################

####-Resizing by fase,or not if no face detected and saving-##########
(im_heigth,im_width,ch) = image.shape

if (len(faces) == 1):
        (x, y, w, h) = faces[0]
        rate = 0.4
        margin_w = (w * rate)
        margin_h = (h * rate)
        print('[-PYTHON RESIZE-]: image > width:{0} height:{1}'.format(im_width,im_heigth))
        print('[-INFO-]: face width > {0}; face heigth > {1}'.format(w,h))
        res_y = y - margin_h if (y - margin_h > 0) else 0
        res_x = x - margin_w if (x - margin_w > 0) else 0
        res_h = y + h + margin_h if(y + h + margin_h) < im_heigth else im_heigth
        res_w =  x + w + margin_w if (x + w + margin_w) < im_width else im_width
        print('[-PYTHON RESIZE-]: margin-y: {0}'.format(margin_h))
        print('[-PYTHON RESIZE-]: margin-x: {0}'.format(margin_w))
        face_coord = image[int(res_y):int(res_h), int(res_x):int(res_w)]
        
        status = cv2.imwrite(image_path, resizeBySize(face_coord,heigth,width))
        print('[-PYTHON RESIZE-]: image saved {0}'.format(status))

else:  
     status = cv2.imwrite(image_path,resizeBySize(image,width,heigth))
     print('[-INFO-]: image saved {0}'.format(status))
        



