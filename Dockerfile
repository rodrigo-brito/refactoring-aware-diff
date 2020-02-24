FROM rtfpessoa/ubuntu-jdk8

WORKDIR /refdiff

ADD refdiff_lib/ refdiff_lib/
ADD refdiff.jar .

CMD java -cp "/refdiff/refdiff_lib/*" -jar /refdiff/refdiff.jar