import sys
sys.dont_write_bytecode = True

import decimal
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchvision import datasets, transforms
from torch.autograd import Variable
import cv2
import sys
import numpy as np
from skimage import segmentation
import torch.nn.init
from scipy.spatial.distance import pdist, euclidean

from classes.segmentation_net import Segmentation_Net

from utils.utils import imgToString, saveImg, create_dir

sys.stdout = sys.stderr

class Segmentation_Wrapper():
	def __init__(self, image, hyperparameters, file_name, file_type, email, time_uploaded, usr_img_dir):
		print("this is segmentation wrapper init", hyperparameters)

		self.image = image
		self.file_name = file_name.split(".")[0]
		self.file_type = file_type.replace("image/", ".")
		
		self.maxIter = hyperparameters["maxIter"]
		# self.maxIter = 100
		self.minLabels = hyperparameters["minLabels"]
		self.lr = hyperparameters["lr"]
		self.nConv = hyperparameters["nConv"]
		self.num_superpixels = hyperparameters["num_superpixels"]
		self.compactness = hyperparameters["compactness"]
		self.nChannel = hyperparameters["nChannel"]
		self.momentum = hyperparameters["momentum"]
		
		self.nLabels = 0
		self.data = 0
		self.im_target = []
		self.label_colors = []
		self.cache = []

		# for now use false
		# self.use_cuda = torch.cuda.is_available()
		self.use_cuda = True

		self.usr_img_dir = usr_img_dir

	def process(self):
		return "this is segmentation module test"


	def slic_image(self):
		labels = segmentation.slic(self.image, compactness=self.compactness, n_segments=self.num_superpixels)
		labels = labels.reshape(self.image.shape[0]*self.image.shape[1])
		u_labels = np.unique(labels)
		self.l_inds = []
		for i in range(len(u_labels)):
			self.l_inds.append(np.where(labels == u_labels[i])[0])

	def process_img(self):
		print("self image shape")
		print(self.image.shape)
		
		self.data = torch.from_numpy( np.array([self.image.transpose( (2, 0, 1) ).astype('float32')/255.]))
		# print(data, file=sys.stderr)
		if self.use_cuda:
			self.data = self.data.cuda()
		self.data = Variable(self.data)

	def start(self):
		# import the model
		print("before process img")
		self.process_img()
		print("self data size")

		self.slic_image()
		print("image slic'd", flush=True)

		self.create_label_colors()

		print("this is self.data.size(1)")
		print(self.data.size(1))
		model = Segmentation_Net(self.data.size(1), self.nChannel, self.nConv)

		if self.use_cuda:
			model.cuda()
			for i in range(self.nConv-1):
				model.conv2[i].cuda()
				model.bn2[i].cuda()

		print("starting")

		# model.train()


		loss_fn = torch.nn.CrossEntropyLoss()
		optimizer = optim.SGD(model.parameters(), lr=self.lr, momentum=self.momentum)

		print("this is the loss_fn", loss_fn)
		print("finished making loss_fn")

		# seems to be running synchronously

		for batch_idx in range(self.maxIter):
			# print("inside batch", flush=True)
			# forwarding
			optimizer.zero_grad()
			output = model(self.data)[0]
			output = output.permute(1, 2, 0).contiguous().view( -1, self.nChannel)
			ignore, target = torch.max(output, 1)
			self.im_target = target.data.cpu().numpy()
			self.nLabels = len(np.unique(self.im_target))

			target = self.superpixel_refinement()

			if self.use_cuda:
				target = target.cuda()
			
			target = Variable(target)
			loss = loss_fn(output, target)
			loss.backward()
			optimizer.step()

			print (batch_idx, '/', self.maxIter, ':', self.nLabels, loss.data.item())

			# check is self.cache has that nLabels in it (create function for this)

			# if self.nLabels not in self.cache:
			if not any(d['nLabels'] == self.nLabels for d in self.cache) or batch_idx == self.maxIter - 1:
				im_target_rgb = self.cache_segmentation(model, output)
				# self.davies_bouldin(im_target_rgb)

			# im_target_rgb = self.cache_segmentation(model, output)

			# print("this is current cache", self.cache)	

			if self.nLabels <= self.minLabels:
				print ("nLabels", self.nLabels, "reached minLabels", self.minLabels, ".")
				break

		return self.cache

	def cache_segmentation(self, model, output):
		# directly cache these images as base64 strings

		output = model(self.data)[0]
		output = output.permute( 1, 2, 0 ).contiguous().view(-1, self.nChannel)
		ignore, target = torch.max(output, 1)
		im_target = target.data.cpu().numpy()
		im_target_rgb = np.array([self.label_colours[c % 100] for c in im_target])
		im_target_rgb = im_target_rgb.reshape(self.image.shape).astype( np.uint8 )

		print("this is im_target_rgb shape", im_target_rgb.shape)

		# change to base64 string before storing in dict
		# or store a dict inside dict
		# ex. {
		# 	baseString: ,
		#	npArray: ,
		# }

		# values = {
		# 	'numpy_arr': im_target_rgb,
		# 	'base_64': imgtToString(im_target_rgb)
		# }

		# segmented_image = imgToString(im_target_rgb)

		print("this is file_name", self.file_name)
		print("this is file type", self.file_type)
		
		appended_file_name = self.usr_img_dir + self.file_name + "_" + str(self.nLabels) + self.file_type
		saveImg(im_target_rgb, appended_file_name)


		# saveImg(im_target_rgb)

		# save segmented image somewhere, then use segmented to be a link to file path
		cached_image = {
			'nLabels': self.nLabels,
			'segmented_path': appended_file_name
		}
		self.cache.append(cached_image)

		# return segmented_image
		return 'temp'


	def superpixel_refinement(self):
		for i in range(len(self.l_inds)):
			labels_per_sp = self.im_target[self.l_inds[ i ] ]
			u_labels_per_sp = np.unique(labels_per_sp)
			hist = np.zeros( len(u_labels_per_sp) )
			for j in range(len(hist)):
				hist[ j ] = len( np.where( labels_per_sp == u_labels_per_sp[ j ] )[ 0 ] )
			self.im_target[self.l_inds[i]] = u_labels_per_sp[ np.argmax( hist ) ]
			target = torch.from_numpy(self.im_target)
		return target

	def create_label_colors(self):
		np.random.seed(0)
		self.label_colours = np.random.randint(255, size=(100,3))

	# def davies_bouldin(self, X):
	# 	print("inside davies_bouldin")
	# 	print("this is x shape", X.shape)
	# 	labels = np.unique(X)
	# 	print("this is labels", labels)

	# 	n_cluster = len(np.bincount(labels))
	# 	cluster_k = [X[labels == k] for k in range(n_cluster)]
	# 	centroids = [np.mean(k, axis = 0) for k in cluster_k]
	# 	variances = [np.mean([euclidean(p, centroids[i]) for p in k]) for i, k in enumerate(cluster_k)]
	# 	db = []

	# 	for i in range(n_cluster):
	# 		for j in range(n_cluster):
	# 			if j != i:
	# 				db.append((variances[i] + variances[j]) / euclidean(centroids[i], centroids[j]))

	# 	cluster_score = np.max(db) / n_cluster
	# 	print("this is max db", cluster_score)
	# 	return(np.max(db) / n_cluster)
