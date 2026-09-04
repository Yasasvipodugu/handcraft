lines<-readLines("C:/Users/yasas/OneDrive/Documents/csd37/input.txt")
keyword<-"data"
result<-grep(keyword,lines,value=TRUE)
writeLines(result,"output.txt")
print(result)