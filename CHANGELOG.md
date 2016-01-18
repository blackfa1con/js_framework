### 0.1.18(2016-01-18)

### Features

* **$list :** 
  * ```update``` 함수 실행시 템플릿 정보를 직접 입력 가능하게 수정
  * 리스트 구현시 모든 리스트를 만든 후 html에 attach하게 수정
* **$promise :**
  * promise 미지원 브라우저에서는 내부 구현된 promise사용

 
### 0.1.17(2015-12-29)

### Features

* **$pager :** 
  * ```chagePageTitle```, ```clearHistory``` 추가
* **$ajax :**
  * ```req```함수에 **dataType** 옵션 추가
* **$progress**
  * ```show```함수 호출시 **timeout** 옵션 설정 가능하게 수정 

### 0.1.16(2015-11-09)

### Features

* **native module :** $promise와 $ajax 추가
* **$pager :** 
  * ```setPageTitle``` 함수가 페이지 타이틀을 영구적으로 변경 안되게 수정
  * ```go``` 함수가 일정 timeout 이후에 페이지가 이동 되지 않고 즉시 이동되게 수정
