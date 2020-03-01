FROM rtfpessoa/ubuntu-jdk8

WORKDIR /refdiff

ADD dist/refdiff_lib/ refdiff_lib/
ADD dist/refdiff.jar .

CMD java -cp "/refdiff/refdiff_lib/*" -jar /refdiff/refdiff.jar