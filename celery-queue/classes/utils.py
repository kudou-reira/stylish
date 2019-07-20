from tensorflow.keras.layers import Input, Lambda, Dense, Flatten, AveragePooling2D, MaxPooling2D, Conv2D
from tensorflow.keras.models import Model, Sequential
 
from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input
from tensorflow.keras.preprocessing import image
 
from skimage.transform import resize
 
import tensorflow.keras.backend as keras
import numpy as np
 
from scipy.optimize import fmin_l_bfgs_b
from datetime import datetime
 
import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt
 
def img_load(path, shape=None):
    img = image.load_img(path, target_size=shape)
    # not a numpy array right now, convert it to one
    x = image.img_to_array(img)
    # 1 x H x W x C(olor)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
 
    return x
 
def vgg16_avg_pool(shape):
    vgg = VGG16(input_shape=shape, weights='imagenet', include_top=False)
    avg_model = Sequential()
 
    for layer in vgg.layers:
        if layer.__class__ == MaxPooling2D:
            avg_model.add(AveragePooling2D())
        else:
            avg_model.add(layer)
 
    return avg_model
 
def vgg16_avg_pool_cutoff(shape, num_conv):
    if num_conv < 1 or num_conv > 13:
        print("number of convolutions has to be between 1 and 13")
        return None
     
    model = vgg16_avg_pool(shape)
    avg_model = Sequential()
    num = 0
     
    for layer in model.layers:
        if layer.__class__ == Conv2D:
            num += 1
        avg_model.add(layer)
 
        if num > num_conv or num == num_conv:
            break
     
    return avg_model
 
def calc_gram_matrix(img):
    # img is input in H, W, feature maps
    # convert it to (C, H x W)
    x = keras.batch_flatten(keras.permute_dimensions(img, (2, 0, 1)))
     
    # calculate gram matrix X XT / number of elements
    gram_matrix = keras.dot(x, keras.transpose(x)) / img.get_shape().num_elements()
    return gram_matrix
 
def style_loss(y, y1):
    return keras.mean(keras.square(calc_gram_matrix(y) - calc_gram_matrix(y1)))
 
# need to reformat from keras preprocessing to vgg format
def reformat(img):
    img[..., 0] += 103.939
    img[..., 1] += 116.779
    img[..., 2] += 126.68
 
    img = img[..., ::-1]
 
    return img
 
# normalize pixel intensity to between 0 and 1 for matplotlib plotting purposes
def normalize_img(x):
    x = x - x.min()
    x = x / x.max()
 
    return x
 
def minimize(fn, epochs, batch_shape):
    t_initial = datetime.now()
    losses = []
    x = np.random.randn(np.prod(batch_shape))
 
    for i in range(epochs):
        x, loss, _ = fmin_l_bfgs_b(
            func=fn,
            x0=x,
            maxfun=20
        )
 
        x = np.clip(x, -127, 127)
        print("iteration: {}, loss: {}".format(i, loss))
        losses.append(loss)
 
    print("duration: ", datetime.now() - t_initial)
    plt.plot(losses)
    plt.show()
 
    newimg = x.reshape(*batch_shape)
    reformatted_img = reformat(newimg)
    return reformatted_img[0]
 
def show_img(img):
    plt.imshow(normalize_img(img))
    plt.show()

def save_img(img):
    plt.imshow(normalize_img(img))
    plt.show()