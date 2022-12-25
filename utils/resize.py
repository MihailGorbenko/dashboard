import sys
import cv2
import argparse
import os


parser = argparse.ArgumentParser(
    description='Resizing images with face detection as option')
parser.add_argument('image_path', type=str,
                     help='Location of resizing image')

parser.add_argument('result_path', type=str,
                     help='Location of results')

parser.add_argument('--width', type=int, default=100,
                    help='Required width. Default 100px')

parser.add_argument('--height', type=int, default=100,
                    help='Required height. Default 100px')

parser.add_argument('--detect',action='store_true',default=False,
                    help='Use face detection')

parser.add_argument('--max-faces', type=int, default=1,
                    help='Max count of faces to save. Default one')

args = parser.parse_args()


image_path = args.image_path
result_path = args.result_path
width = args.width
heigth = args.height
detectFaces = args.detect
maxFaces = args.max_faces


def resizeBySize(image, width, heigth):
    (img_h, img_w, ch) = image.shape
    print('[-RESIZE INFO-]: image heigth > {0}; image width > {1}'.format(img_h, img_w))
    print('[-RESIZE INFO-]: req heigth > {0}; req width > {1}'.format(heigth, width))
    rate = max(img_w, width) / min(img_w, width)
    print('[-RESIZE INFO-]: rate > {0}'.format(rate))
    dim = (int(img_w / rate), int(img_h / rate)) if (int(img_w) >
                                                     width) | (int(img_h) > heigth) else (int(img_w * rate), int(img_h * rate))
    print(dim)
    resized = cv2.resize(image, dim, interpolation=cv2.INTER_AREA)
    (h, w, c) = resized.shape
    print('[-RESIZE INFO-]: resized width > {0}; resized heigth > {1}'.format(w, h))
    return resized



image = cv2.imread(image_path)
print('[-RESIZE INFO-]: open image {0}'.format(image_path))

#### -Searching faces-#############
if(detectFaces):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        faceCascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        faces = faceCascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=8,
            minSize=(80, 80)
        )
        print('[-RESIZE INFO-]: found {0} faces'.format(len(faces)))
        (im_heigth, im_width, ch) = image.shape

        count = 0

        for (x, y, w, h) in faces:
            if count >= maxFaces: break
            rate = 0.4
            margin_w = (w * rate)
            margin_h = (h * rate)
            print('[-RESIZE INFO-]: image > width:{0} height:{1}'.format(im_width, im_heigth))
            print('[-RESIZE INFO-]: face width > {0}; face heigth > {1}'.format(w, h))
            res_y = y - margin_h if (y - margin_h > 0) else 0
            res_x = x - margin_w if (x - margin_w > 0) else 0
            res_h = y + h + margin_h if (y + h + margin_h) < im_heigth else im_heigth
            res_w = x + w + margin_w if (x + w + margin_w) < im_width else im_width
            print('[-RESIZE INFO-]: margin-y: {0}'.format(margin_h))
            print('[-RESIZE INFO-]: margin-x: {0}'.format(margin_w))
            face_coord = image[int(res_y):int(res_h), int(res_x):int(res_w)]
            
            prefix = str(count) + '-' if (maxFaces > 1) else ''
            face_path  = result_path + '/' + prefix + os.path.basename(image_path)
            status = cv2.imwrite(face_path, resizeBySize(face_coord, heigth, width))
            print('[-RESIZE INFO-]: image saved with detecting{0}'.format(status))
            count+=1

else:
    status = cv2.imwrite(result_path +'/'+ os.path.basename(image_path), resizeBySize(image, width, heigth))
    print('[-RESIZE INFO-]: image saved without detecting{0}'.format(status))



#################################

# -Saving bordered faces image-###
# cp_image = image.copy()
# for (x,y,w,h) in faces:
#     cv2.rectangle(cp_image,(x,y),(x+w,y+h),(0,255,0),4)

# cv2.imwrite('face_detected.jpg',cp_image)

#################################

#### -Resizing by fase,or not if no face detected and saving-##########



