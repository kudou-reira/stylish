from tensorflow.keras.layers import Input, Lambda, Dense, Flatten, AveragePooling2D, MaxPooling2D, Conv2D
from tensorflow.keras.models import Model, Sequential
 
from tensorflow.keras.preprocessing import image
 
from skimage.transform import resize
import numpy as np
 
import tensorflow.keras.backend as keras
 
from classes.utils import img_load, vgg16_avg_pool, vgg16_avg_pool_cutoff, style_loss, minimize, show_img, export_figure_matplotlib
 
# config = tf.ConfigProto()
# config.gpu_options.allow_growth = True  # dynamically grow the memory used on the GPU
# config.log_device_placement = True  # to log device placement (on which device the operation ran)
#                                     # (nothing gets printed in Jupyter, only if you run it standalone)
# sess = tf.Session(config=config)
# set_session(sess)  # set this TensorFlow session as the default session for Keras
 
class Style_Transfer(object):
    def __init__(self, initial_img, style_img, output_path, output_name):
        self.initial = initial_img
        self.style = style_img
        self.output_path = output_path
        self.output_name = output_name
 
        self.vgg = None
        self.batch_shape = None
 
        self.initial_model = None
        self.initial_target = None
 
        self.style_model = None
        self.symbolic_conv_outputs = None
        self.style_layer_outputs = None
        self.style_weights = None
 
        self.loss = None
         
 
    def create_initial_model(self, shape):
        # create original image model
        print("this is vgg", self.vgg)
        print("this is vgg input", self.vgg.input)
 
        # self.initial_model = vgg16_avg_pool_cutoff(shape, 11)
        self.initial_model = Model(self.vgg.input, self.vgg.layers[11].get_output_at(1))
        self.initial_target = keras.variable(self.initial_model.predict(self.initial))
 
    def create_style_model(self):
        # create style model
 
        # want to get all convs that end with 1
        # this is because when vgg16 is created, we created a new model that uses avg pool instead of max pool
        # max pool has the index 0, so avg pool has index 1
 
        self.symbolic_conv_outputs = [layer.get_output_at(1) for layer in self.vgg.layers if layer.name.endswith('conv1')]
        self.style_model = Model(self.vgg.input, self.symbolic_conv_outputs)
 
        self.style_layer_outputs = [keras.variable(y) for y in self.style_model.predict(self.style)]
 
        self.style_weights = [1, 2, 3, 4, 5]
 
    def create_loss(self):
        self.loss = keras.mean(keras.square(self.initial_model.output - self.initial_target))
 
        for w, sym, act in zip(self.style_weights, self.symbolic_conv_outputs, self.style_layer_outputs):
            self.loss += w * style_loss(sym[0], act[0])
 
    def create_loss_grads(self):
        grads = keras.gradients(self.loss, self.vgg.input)
 
        self.loss_and_grads = keras.function(
            inputs=[self.vgg.input],
            outputs= [self.loss] + grads
        )
 
    def loss_and_grads_wrapper(self, vector_1D):
        # use * to allow arbitrary number of arguments of batch_shape
        loss, grads = self.loss_and_grads([vector_1D.reshape(*self.batch_shape)])
        return loss.astype(np.float64), grads.flatten().astype(np.float64)
 
 
    def process(self):
        self.initial = img_load(self.initial)
        h, w = self.initial.shape[1:3]
 
        self.style = img_load(self.style, (h, w))
 
        self.batch_shape = self.initial.shape
        shape = self.initial.shape[1:]
 
        self.vgg = vgg16_avg_pool(shape)
 
        self.create_initial_model(shape)
        self.create_style_model()
 
        self.create_loss()
        self.create_loss_grads()
 
        print("this is createloss", self.loss)
        print("this is create loss grads", self.loss_and_grads)

        # show progress of minimize?
 
        plot_path = self.output_path + "plot.png"
        img = minimize(self.loss_and_grads_wrapper, 10, self.batch_shape, plot_path)
        # show_img(img)
        print("this is img", img)

        output_img = self.output_path + self.output_name
        export_figure_matplotlib(img, output_img)

        cache = {
			'plot': plot_path,
			'output': output_img
		}

        return cache