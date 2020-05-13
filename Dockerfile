FROM openjdk:8-jre-alpine

ENV REFDIFF_GO_PARSER /refdiff/parser
WORKDIR /refdiff

ADD dist/refdiff_lib/ refdiff_lib/
ADD dist/refdiff.jar .
ADD bin/parser /refdiff/parser

CMD java -cp "/refdiff/refdiff_lib/*" -jar /refdiff/refdiff.jar
