@echo off
 echo 正在检查MongoDB安装情况...
 if exist "C:\Program Files\MongoDB\Server\8.0" (
   echo 找到MongoDB安装目录
   echo 检测到MongoDB版本: 8.0
   echo 尝试启动MongoDB服务...
   "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --version
 ) else (
   echo 未找到MongoDB安装目录
   echo 请确认MongoDB已安装在C:\Program Files\MongoDB\Server\8.0路径下
 )
 pause