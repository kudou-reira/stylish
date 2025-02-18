import sys
sys.dont_write_bytecode = True

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchvision import datasets, transforms
from torch.autograd import Variable

class Segmentation_Net(nn.Module):
	def __init__(self, input_dim, nChannel, nConv):
		self.nChannel = nChannel
		self.input_dim = input_dim
		self.nConv = nConv

		super(Segmentation_Net, self).__init__()

		# i don't have input dim here, i have to calc it and set it to self
		self.conv1 = nn.Conv2d(self.input_dim, self.nChannel, kernel_size=3, stride=1, padding=1)
		self.bn1 = nn.BatchNorm2d(self.nChannel)
		self.conv2 = []
		self.bn2 = []
		for i in range(self.nConv-1):
			self.conv2.append( nn.Conv2d(self.nChannel, self.nChannel, kernel_size=3, stride=1, padding=1 ) )
			self.bn2.append( nn.BatchNorm2d(self.nChannel) )
		self.conv3 = nn.Conv2d(self.nChannel, self.nChannel, kernel_size=1, stride=1, padding=0)
		self.bn3 = nn.BatchNorm2d(self.nChannel)

	def forward(self, x):
		x = self.conv1(x)
		x = F.relu(x)
		x = self.bn1(x)
		for i in range(self.nConv-1):
			x = self.conv2[i](x)
			x = F.relu(x)
			x = self.bn2[i](x)
		x = self.conv3(x)
		x = self.bn3(x)
		return x